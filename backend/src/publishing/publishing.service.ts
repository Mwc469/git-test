import { Injectable, Logger } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { PostsService } from '../posts/posts.service';
import { SocialService } from '../social/social.service';
import { ContentService } from '../content/content.service';
import { YouTubePublisher } from './publishers/youtube.publisher';
import { InstagramPublisher } from './publishers/instagram.publisher';
import { FacebookPublisher } from './publishers/facebook.publisher';
import { TikTokPublisher } from './publishers/tiktok.publisher';
import { IPublisher, PublishRequest } from './interfaces/publisher.interface';

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);
  private publishers: Map<Platform, IPublisher>;

  constructor(
    private postsService: PostsService,
    private socialService: SocialService,
    private contentService: ContentService,
    private youtubePublisher: YouTubePublisher,
    private instagramPublisher: InstagramPublisher,
    private facebookPublisher: FacebookPublisher,
    private tiktokPublisher: TikTokPublisher,
  ) {
    // Initialize publishers map
    this.publishers = new Map<Platform, IPublisher>();
    this.publishers.set(Platform.YOUTUBE, youtubePublisher);
    this.publishers.set(Platform.INSTAGRAM, instagramPublisher);
    this.publishers.set(Platform.FACEBOOK, facebookPublisher);
    this.publishers.set(Platform.TIKTOK, tiktokPublisher);
  }

  /**
   * Publish a post to all its target platforms
   */
  async publishPost(postId: string): Promise<void> {
    this.logger.log(`Starting publication for post ${postId}`);

    const post = await this.postsService.getPost(postId);

    if (!post) {
      this.logger.error(`Post ${postId} not found`);
      return;
    }

    // Mark post as publishing
    await this.postsService.markAsPublishing(postId);

    let allSuccessful = true;

    // Publish to each platform
    for (const postPlatform of post.platforms) {
      try {
        this.logger.log(
          `Publishing to ${postPlatform.socialAccount.platform}...`,
        );

        const publisher = this.publishers.get(
          postPlatform.socialAccount.platform,
        );

        if (!publisher) {
          throw new Error(
            `No publisher found for ${postPlatform.socialAccount.platform}`,
          );
        }

        // Get decrypted tokens
        const account = await this.socialService.getAccountWithDecryptedTokens(
          postPlatform.socialAccountId,
        );

        // Prepare publish request
        const publishRequest: PublishRequest = {
          caption: post.caption,
          contentUrl: post.content?.fileUrl,
          contentType: post.content?.mimeType,
          thumbnailUrl: post.content?.thumbnailUrl,
          accessToken: account.decryptedAccessToken,
          refreshToken: account.decryptedRefreshToken,
        };

        // Publish
        const result = await publisher.publish(publishRequest);

        // Update platform status
        if (result.success) {
          await this.postsService.updatePlatformStatus(
            postPlatform.id,
            'PUBLISHED' as any,
            result.platformPostId,
            result.platformUrl,
          );

          this.logger.log(
            `Successfully published to ${postPlatform.socialAccount.platform}`,
          );
        } else {
          allSuccessful = false;
          await this.postsService.updatePlatformStatus(
            postPlatform.id,
            'FAILED' as any,
            undefined,
            undefined,
            result.errorMessage,
          );

          this.logger.error(
            `Failed to publish to ${postPlatform.socialAccount.platform}: ${result.errorMessage}`,
          );
        }
      } catch (error) {
        allSuccessful = false;
        this.logger.error(
          `Error publishing to ${postPlatform.socialAccount.platform}: ${error.message}`,
        );

        await this.postsService.updatePlatformStatus(
          postPlatform.id,
          'FAILED' as any,
          undefined,
          undefined,
          error.message,
        );
      }
    }

    // Update overall post status
    if (allSuccessful) {
      await this.postsService.markAsPublished(postId);
      this.logger.log(`Post ${postId} published successfully to all platforms`);
    } else {
      await this.postsService.markAsFailed(
        postId,
        'Failed to publish to one or more platforms',
      );
      this.logger.error(`Post ${postId} had failures during publication`);
    }
  }

  /**
   * Process all scheduled posts
   */
  async processScheduledPosts(): Promise<void> {
    this.logger.log('Processing scheduled posts...');

    const scheduledPosts = await this.postsService.getScheduledPosts();

    this.logger.log(`Found ${scheduledPosts.length} posts to publish`);

    for (const post of scheduledPosts) {
      try {
        await this.publishPost(post.id);
      } catch (error) {
        this.logger.error(
          `Failed to publish post ${post.id}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Get publisher for a specific platform
   */
  getPublisher(platform: Platform): IPublisher | undefined {
    return this.publishers.get(platform);
  }
}
