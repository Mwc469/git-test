import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Platform } from '@prisma/client';
import axios from 'axios';
import {
  IPublisher,
  PublishRequest,
  PublishResult,
} from '../interfaces/publisher.interface';

@Injectable()
export class InstagramPublisher implements IPublisher {
  platform = Platform.INSTAGRAM;
  private readonly logger = new Logger(InstagramPublisher.name);
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(private configService: ConfigService) {}

  /**
   * Publish to Instagram
   * Note: Requires Instagram Business Account connected to Facebook Page
   */
  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      this.logger.log('Starting Instagram post publication');

      // Step 1: Get Instagram Business Account ID
      const igAccountId = await this.getInstagramAccountId(request.accessToken);

      // Step 2: Create media container
      const containerId = await this.createMediaContainer(
        igAccountId,
        request,
      );

      // Step 3: Publish the container
      const postId = await this.publishMedia(
        igAccountId,
        containerId,
        request.accessToken,
      );

      const postUrl = `https://www.instagram.com/p/${this.getShortcode(postId)}`;

      this.logger.log(`Instagram post published successfully: ${postUrl}`);

      return {
        success: true,
        platformPostId: postId,
        platformUrl: postUrl,
      };
    } catch (error) {
      this.logger.error(`Instagram publishing failed: ${error.message}`);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Delete an Instagram post
   */
  async delete(postId: string, accessToken: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${postId}`, {
        params: { access_token: accessToken },
      });

      this.logger.log(`Instagram post ${postId} deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Instagram post deletion failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Update an Instagram post caption
   * Note: Instagram Graph API has limited edit capabilities
   */
  async update(
    postId: string,
    caption: string,
    accessToken: string,
  ): Promise<boolean> {
    try {
      // Instagram doesn't support caption editing via API for most post types
      this.logger.warn('Instagram caption editing not supported via API');
      return false;
    } catch (error) {
      this.logger.error(`Instagram post update failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get Instagram Business Account ID from access token
   */
  private async getInstagramAccountId(accessToken: string): Promise<string> {
    const response = await axios.get(`${this.baseUrl}/me/accounts`, {
      params: {
        access_token: accessToken,
        fields: 'instagram_business_account',
      },
    });

    if (!response.data.data?.[0]?.instagram_business_account?.id) {
      throw new Error('No Instagram Business Account found');
    }

    return response.data.data[0].instagram_business_account.id;
  }

  /**
   * Create media container
   */
  private async createMediaContainer(
    igAccountId: string,
    request: PublishRequest,
  ): Promise<string> {
    const isVideo = request.contentType?.startsWith('video/');

    const params: any = {
      access_token: request.accessToken,
      caption: request.caption,
    };

    if (isVideo) {
      params.media_type = 'VIDEO';
      params.video_url = request.contentUrl;
      if (request.thumbnailUrl) {
        params.thumb_offset = 0; // Thumbnail time offset in milliseconds
      }
    } else {
      params.image_url = request.contentUrl;
    }

    const response = await axios.post(
      `${this.baseUrl}/${igAccountId}/media`,
      null,
      { params },
    );

    return response.data.id;
  }

  /**
   * Publish media container
   */
  private async publishMedia(
    igAccountId: string,
    containerId: string,
    accessToken: string,
  ): Promise<string> {
    // For videos, wait for processing
    await this.waitForMediaProcessing(containerId, accessToken);

    const response = await axios.post(
      `${this.baseUrl}/${igAccountId}/media_publish`,
      null,
      {
        params: {
          creation_id: containerId,
          access_token: accessToken,
        },
      },
    );

    return response.data.id;
  }

  /**
   * Wait for media processing (mainly for videos)
   */
  private async waitForMediaProcessing(
    containerId: string,
    accessToken: string,
  ): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await axios.get(`${this.baseUrl}/${containerId}`, {
        params: {
          fields: 'status_code',
          access_token: accessToken,
        },
      });

      const statusCode = response.data.status_code;

      if (statusCode === 'FINISHED') {
        return;
      } else if (statusCode === 'ERROR') {
        throw new Error('Media processing failed');
      }

      // Wait 2 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Media processing timeout');
  }

  /**
   * Get shortcode from post ID (simplified)
   */
  private getShortcode(postId: string): string {
    // Instagram post IDs can be converted to shortcodes
    // This is a placeholder - actual conversion requires Instagram's algorithm
    return postId.split('_')[0];
  }
}
