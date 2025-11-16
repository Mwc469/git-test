import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';
import { Platform } from '@prisma/client';
import {
  IPublisher,
  PublishRequest,
  PublishResult,
} from '../interfaces/publisher.interface';
import { GoogleDriveService } from '../../drive/google-drive.service';

@Injectable()
export class YouTubePublisher implements IPublisher {
  platform = Platform.YOUTUBE;
  private readonly logger = new Logger(YouTubePublisher.name);

  constructor(
    private configService: ConfigService,
    private googleDriveService: GoogleDriveService,
  ) {}

  /**
   * Publish a video to YouTube
   */
  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      this.logger.log('Starting YouTube video upload');

      const youtube = this.getYouTubeClient(
        request.accessToken,
        request.refreshToken,
      );

      // Download video from Drive (if contentUrl is a Drive file)
      let videoStream;
      if (request.contentUrl?.includes('drive.google.com')) {
        const fileId = this.extractDriveFileId(request.contentUrl);
        videoStream = await this.googleDriveService.getFileStream(
          fileId,
          request.accessToken,
          request.refreshToken,
        );
      } else {
        // For other URLs, you'd implement different download logic
        throw new Error('Only Google Drive URLs are currently supported');
      }

      // Upload video to YouTube
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: this.extractTitle(request.caption),
            description: request.caption,
            // tags: this.extractTags(request.caption),
            categoryId: '10', // Music category
          },
          status: {
            privacyStatus: 'public', // Can be 'private', 'public', or 'unlisted'
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: videoStream,
        },
      });

      const videoId = response.data.id;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      this.logger.log(`YouTube video uploaded successfully: ${videoUrl}`);

      return {
        success: true,
        platformPostId: videoId,
        platformUrl: videoUrl,
      };
    } catch (error) {
      this.logger.error(`YouTube upload failed: ${error.message}`);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Delete a video from YouTube
   */
  async delete(videoId: string, accessToken: string): Promise<boolean> {
    try {
      const youtube = this.getYouTubeClient(accessToken);

      await youtube.videos.delete({
        id: videoId,
      });

      this.logger.log(`YouTube video ${videoId} deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`YouTube video deletion failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Update a YouTube video's metadata
   */
  async update(
    videoId: string,
    caption: string,
    accessToken: string,
  ): Promise<boolean> {
    try {
      const youtube = this.getYouTubeClient(accessToken);

      await youtube.videos.update({
        part: ['snippet'],
        requestBody: {
          id: videoId,
          snippet: {
            title: this.extractTitle(caption),
            description: caption,
            categoryId: '10',
          },
        },
      });

      this.logger.log(`YouTube video ${videoId} updated successfully`);
      return true;
    } catch (error) {
      this.logger.error(`YouTube video update failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get authenticated YouTube client
   */
  private getYouTubeClient(
    accessToken: string,
    refreshToken?: string,
  ): youtube_v3.Youtube {
    const auth = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );

    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.youtube({ version: 'v3', auth });
  }

  /**
   * Extract title from caption (first line or first 100 chars)
   */
  private extractTitle(caption: string): string {
    const firstLine = caption.split('\n')[0];
    return firstLine.length > 100
      ? firstLine.substring(0, 97) + '...'
      : firstLine;
  }

  /**
   * Extract Drive file ID from URL
   */
  private extractDriveFileId(url: string): string {
    const match = url.match(/[-\w]{25,}/);
    if (!match) {
      throw new Error('Invalid Google Drive URL');
    }
    return match[0];
  }

  /**
   * Extract hashtags from caption
   */
  private extractTags(caption: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;

    while ((match = hashtagRegex.exec(caption)) !== null) {
      tags.push(match[1]);
    }

    return tags;
  }
}
