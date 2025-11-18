import { Injectable, Logger } from '@nestjs/common';
import { Platform } from '@prisma/client';
import axios from 'axios';
import {
  IPublisher,
  PublishRequest,
  PublishResult,
} from '../interfaces/publisher.interface';

@Injectable()
export class TikTokPublisher implements IPublisher {
  platform = Platform.TIKTOK;
  private readonly logger = new Logger(TikTokPublisher.name);
  private readonly baseUrl = 'https://open.tiktokapis.com/v2';

  /**
   * Publish a video to TikTok
   */
  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      this.logger.log('Starting TikTok video publication');

      // Step 1: Initialize video upload
      const uploadInfo = await this.initializeUpload(request);

      // Step 2: Upload video chunks
      await this.uploadVideo(uploadInfo.upload_url, request.contentUrl);

      // Step 3: Publish the video
      const publishId = await this.publishVideo(
        uploadInfo.publish_id,
        request,
      );

      const videoUrl = `https://www.tiktok.com/@user/video/${publishId}`;

      this.logger.log(`TikTok video published successfully`);

      return {
        success: true,
        platformPostId: publishId,
        platformUrl: videoUrl,
      };
    } catch (error) {
      this.logger.error(`TikTok publishing failed: ${error.message}`);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Delete a TikTok video
   * Note: TikTok Content Posting API may have limitations on deletion
   */
  async delete(videoId: string, accessToken: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/post/publish/video/delete/`,
        {
          post_id: videoId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`TikTok video ${videoId} deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`TikTok video deletion failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Update TikTok video metadata
   * Note: TikTok has limited edit capabilities after publishing
   */
  async update(
    videoId: string,
    caption: string,
    accessToken: string,
  ): Promise<boolean> {
    try {
      // TikTok doesn't support editing published videos via API
      this.logger.warn('TikTok video editing not supported via API');
      return false;
    } catch (error) {
      this.logger.error(`TikTok video update failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Initialize video upload
   */
  private async initializeUpload(request: PublishRequest): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/post/publish/video/init/`,
      {
        post_info: {
          title: this.extractTitle(request.caption),
          description: request.caption,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: 0, // Will be determined during upload
          chunk_size: 10000000, // 10MB chunks
          total_chunk_count: 1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.data;
  }

  /**
   * Upload video to TikTok
   */
  private async uploadVideo(
    uploadUrl: string,
    videoUrl: string,
  ): Promise<void> {
    // Download video from source
    const videoResponse = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
    });

    // Upload to TikTok
    await axios.put(uploadUrl, videoResponse.data, {
      headers: {
        'Content-Type': 'video/mp4',
      },
    });
  }

  /**
   * Publish the uploaded video
   */
  private async publishVideo(
    publishId: string,
    request: PublishRequest,
  ): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/post/publish/status/fetch/`,
      {
        publish_id: publishId,
      },
      {
        headers: {
          Authorization: `Bearer ${request.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // Wait for publish to complete
    let status = response.data.data.status;
    let attempts = 0;
    const maxAttempts = 30;

    while (
      status === 'PROCESSING_UPLOAD' &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusResponse = await axios.post(
        `${this.baseUrl}/post/publish/status/fetch/`,
        { publish_id: publishId },
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      status = statusResponse.data.data.status;
      attempts++;
    }

    if (status === 'PUBLISH_COMPLETE') {
      return response.data.data.publish_id;
    } else {
      throw new Error(`TikTok publish failed with status: ${status}`);
    }
  }

  /**
   * Extract title from caption
   */
  private extractTitle(caption: string): string {
    const firstLine = caption.split('\n')[0];
    return firstLine.length > 150
      ? firstLine.substring(0, 147) + '...'
      : firstLine;
  }
}
