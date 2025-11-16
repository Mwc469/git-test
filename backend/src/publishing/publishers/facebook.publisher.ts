import { Injectable, Logger } from '@nestjs/common';
import { Platform } from '@prisma/client';
import axios from 'axios';
import {
  IPublisher,
  PublishRequest,
  PublishResult,
} from '../interfaces/publisher.interface';

@Injectable()
export class FacebookPublisher implements IPublisher {
  platform = Platform.FACEBOOK;
  private readonly logger = new Logger(FacebookPublisher.name);
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  /**
   * Publish to Facebook Page
   */
  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      this.logger.log('Starting Facebook post publication');

      // Get Page ID
      const pageId = await this.getPageId(request.accessToken);

      let postId: string;
      let postUrl: string;

      // Determine if it's a video or photo/link post
      const isVideo = request.contentType?.startsWith('video/');

      if (isVideo) {
        postId = await this.publishVideo(pageId, request);
      } else if (request.contentUrl) {
        postId = await this.publishPhoto(pageId, request);
      } else {
        postId = await this.publishTextPost(pageId, request);
      }

      postUrl = `https://www.facebook.com/${postId}`;

      this.logger.log(`Facebook post published successfully: ${postUrl}`);

      return {
        success: true,
        platformPostId: postId,
        platformUrl: postUrl,
      };
    } catch (error) {
      this.logger.error(`Facebook publishing failed: ${error.message}`);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Delete a Facebook post
   */
  async delete(postId: string, accessToken: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${postId}`, {
        params: { access_token: accessToken },
      });

      this.logger.log(`Facebook post ${postId} deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Facebook post deletion failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Update a Facebook post
   */
  async update(
    postId: string,
    caption: string,
    accessToken: string,
  ): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/${postId}`, null, {
        params: {
          message: caption,
          access_token: accessToken,
        },
      });

      this.logger.log(`Facebook post ${postId} updated successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Facebook post update failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get Facebook Page ID
   */
  private async getPageId(accessToken: string): Promise<string> {
    const response = await axios.get(`${this.baseUrl}/me/accounts`, {
      params: {
        access_token: accessToken,
      },
    });

    if (!response.data.data?.[0]?.id) {
      throw new Error('No Facebook Page found');
    }

    return response.data.data[0].id;
  }

  /**
   * Publish a text-only post
   */
  private async publishTextPost(
    pageId: string,
    request: PublishRequest,
  ): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/${pageId}/feed`, null, {
      params: {
        message: request.caption,
        access_token: request.accessToken,
      },
    });

    return response.data.id;
  }

  /**
   * Publish a photo post
   */
  private async publishPhoto(
    pageId: string,
    request: PublishRequest,
  ): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/${pageId}/photos`,
      null,
      {
        params: {
          url: request.contentUrl,
          caption: request.caption,
          access_token: request.accessToken,
        },
      },
    );

    return response.data.id;
  }

  /**
   * Publish a video post
   */
  private async publishVideo(
    pageId: string,
    request: PublishRequest,
  ): Promise<string> {
    // For videos, use resumable upload
    const response = await axios.post(
      `${this.baseUrl}/${pageId}/videos`,
      null,
      {
        params: {
          file_url: request.contentUrl,
          description: request.caption,
          access_token: request.accessToken,
        },
      },
    );

    return response.data.id;
  }
}
