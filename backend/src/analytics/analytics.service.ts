import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform, Analytics, Prisma } from '@prisma/client';
import { PostsService } from '../posts/posts.service';
import { SocialService } from '../social/social.service';
import { YouTubeCollector } from './collectors/youtube.collector';
import { InstagramCollector } from './collectors/instagram.collector';
import { FacebookCollector } from './collectors/facebook.collector';
import { TikTokCollector } from './collectors/tiktok.collector';
import { IAnalyticsCollector } from './interfaces/collector.interface';

// Type for Analytics with socialAccount relation
type AnalyticsWithAccount = Prisma.AnalyticsGetPayload<{
  include: {
    socialAccount: true;
  };
}>;

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private collectors: Map<Platform, IAnalyticsCollector>;

  constructor(
    private prisma: PrismaService,
    private postsService: PostsService,
    private socialService: SocialService,
    private youtubeCollector: YouTubeCollector,
    private instagramCollector: InstagramCollector,
    private facebookCollector: FacebookCollector,
    private tiktokCollector: TikTokCollector,
  ) {
    // Initialize collectors map
    this.collectors = new Map<Platform, IAnalyticsCollector>();
    this.collectors.set(Platform.YOUTUBE, youtubeCollector);
    this.collectors.set(Platform.INSTAGRAM, instagramCollector);
    this.collectors.set(Platform.FACEBOOK, facebookCollector);
    this.collectors.set(Platform.TIKTOK, tiktokCollector);
  }

  /**
   * Collect analytics for a specific post
   */
  async collectPostAnalytics(postId: string): Promise<void> {
    this.logger.log(`Collecting analytics for post ${postId}`);

    const post = await this.postsService.getPost(postId);

    if (!post) {
      this.logger.error(`Post ${postId} not found`);
      return;
    }

    // Only collect analytics for published posts
    if (post.status !== 'PUBLISHED') {
      this.logger.warn(`Post ${postId} is not published yet`);
      return;
    }

    // Collect analytics for each platform
    for (const postPlatform of post.platforms) {
      if (!postPlatform.platformPostId || postPlatform.status !== 'PUBLISHED') {
        continue;
      }

      try {
        await this.collectPlatformAnalytics(
          postId,
          postPlatform.socialAccountId,
          postPlatform.socialAccount.platform,
          postPlatform.platformPostId,
        );
      } catch (error) {
        this.logger.error(
          `Failed to collect analytics for ${postPlatform.socialAccount.platform}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Collect analytics for a specific platform post
   */
  private async collectPlatformAnalytics(
    postId: string,
    socialAccountId: string,
    platform: Platform,
    platformPostId: string,
  ): Promise<void> {
    const collector = this.collectors.get(platform);

    if (!collector) {
      this.logger.warn(`No collector found for ${platform}`);
      return;
    }

    // Get decrypted tokens
    const account = await this.socialService.getAccountWithDecryptedTokens(
      socialAccountId,
    );

    // Collect metrics
    const metrics = await collector.collectMetrics(
      platformPostId,
      account.decryptedAccessToken,
      account.decryptedRefreshToken,
    );

    // Store analytics
    await this.prisma.analytics.create({
      data: {
        postId,
        socialAccountId,
        views: metrics.views || 0,
        likes: metrics.likes || 0,
        comments: metrics.comments || 0,
        shares: metrics.shares || 0,
        saves: metrics.saves || 0,
        watchTime: metrics.watchTime,
        averageViewDuration: metrics.averageViewDuration,
        clickThroughRate: metrics.clickThroughRate,
        impressions: metrics.impressions,
        reach: metrics.reach,
        profileVisits: metrics.profileVisits,
        completionRate: metrics.completionRate,
        totalPlayTime: metrics.totalPlayTime,
        engagementRate: metrics.engagementRate,
        followersGained: metrics.followersGained,
        followersLost: metrics.followersLost,
      },
    });

    this.logger.log(
      `Analytics collected for post ${postId} on ${platform}`,
    );
  }

  /**
   * Collect analytics for all published posts
   */
  async collectAllAnalytics(): Promise<void> {
    this.logger.log('Collecting analytics for all published posts...');

    // Get published posts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await this.prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        platforms: {
          include: {
            socialAccount: true,
          },
        },
      },
    });

    this.logger.log(`Found ${posts.length} posts to collect analytics for`);

    for (const post of posts) {
      try {
        await this.collectPostAnalytics(post.id);
      } catch (error) {
        this.logger.error(
          `Failed to collect analytics for post ${post.id}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Get analytics for a post
   */
  async getPostAnalytics(postId: string): Promise<AnalyticsWithAccount[]> {
    return this.prisma.analytics.findMany({
      where: { postId },
      include: {
        socialAccount: true,
      },
      orderBy: { fetchedAt: 'desc' },
    });
  }

  /**
   * Get analytics for a user
   */
  async getUserAnalytics(userId: string, limit = 100): Promise<AnalyticsWithAccount[]> {
    return this.prisma.analytics.findMany({
      where: {
        post: {
          userId,
        },
      },
      include: {
        post: true,
        socialAccount: true,
      },
      orderBy: { fetchedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get analytics summary for a user
   */
  async getUserAnalyticsSummary(userId: string) {
    const analytics = await this.getUserAnalytics(userId);

    if (analytics.length === 0) {
      return {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        averageEngagementRate: 0,
        byPlatform: {},
      };
    }

    const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalLikes = analytics.reduce((sum, a) => sum + (a.likes || 0), 0);
    const totalComments = analytics.reduce((sum, a) => sum + (a.comments || 0), 0);
    const totalShares = analytics.reduce((sum, a) => sum + (a.shares || 0), 0);

    const avgEngagement =
      analytics.reduce((sum, a) => sum + (a.engagementRate || 0), 0) /
      analytics.length;

    // Group by platform
    const byPlatform: Record<string, any> = {};
    for (const platform of Object.values(Platform)) {
      const platformAnalytics = analytics.filter(
        (a) => a.socialAccount.platform === platform,
      );

      if (platformAnalytics.length > 0) {
        byPlatform[platform] = {
          totalPosts: platformAnalytics.length,
          totalViews: platformAnalytics.reduce((sum, a) => sum + (a.views || 0), 0),
          totalLikes: platformAnalytics.reduce((sum, a) => sum + (a.likes || 0), 0),
          averageEngagementRate:
            platformAnalytics.reduce((sum, a) => sum + (a.engagementRate || 0), 0) /
            platformAnalytics.length,
        };
      }
    }

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      averageEngagementRate: avgEngagement,
      byPlatform,
    };
  }
}
