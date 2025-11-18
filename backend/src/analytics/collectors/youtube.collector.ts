import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';
import { Platform } from '@prisma/client';
import {
  IAnalyticsCollector,
  PlatformMetrics,
} from '../interfaces/collector.interface';

@Injectable()
export class YouTubeCollector implements IAnalyticsCollector {
  platform = Platform.YOUTUBE;
  private readonly logger = new Logger(YouTubeCollector.name);

  constructor(private configService: ConfigService) {}

  /**
   * Collect metrics for a YouTube video
   */
  async collectMetrics(
    videoId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<PlatformMetrics> {
    try {
      const youtube = this.getYouTubeClient(accessToken, refreshToken);

      // Get video statistics
      const videoResponse = await youtube.videos.list({
        part: ['statistics', 'contentDetails'],
        id: [videoId],
      });

      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        throw new Error(`Video ${videoId} not found`);
      }

      const video = videoResponse.data.items[0];
      const stats = video.statistics;

      // Get analytics data (requires YouTube Analytics API)
      const analyticsData = await this.getVideoAnalytics(
        videoId,
        accessToken,
        refreshToken,
      );

      return {
        views: parseInt(stats?.viewCount || '0'),
        likes: parseInt(stats?.likeCount || '0'),
        comments: parseInt(stats?.commentCount || '0'),
        shares: analyticsData.shares || 0,
        watchTime: analyticsData.watchTime || 0,
        averageViewDuration: analyticsData.averageViewDuration || 0,
        clickThroughRate: analyticsData.clickThroughRate || 0,
        impressions: analyticsData.impressions || 0,
      };
    } catch (error) {
      this.logger.error(
        `Failed to collect YouTube metrics for ${videoId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get video analytics from YouTube Analytics API
   */
  private async getVideoAnalytics(
    videoId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<Partial<PlatformMetrics>> {
    try {
      const youtubeAnalytics = this.getYouTubeAnalyticsClient(
        accessToken,
        refreshToken,
      );

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      const response = await youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        metrics:
          'estimatedMinutesWatched,averageViewDuration,cardClickRate,shares',
        dimensions: 'video',
        filters: `video==${videoId}`,
      });

      const rows = response.data.rows;
      if (!rows || rows.length === 0) {
        return {};
      }

      const row = rows[0];

      return {
        watchTime: (row[1] as number) * 60, // Convert minutes to seconds
        averageViewDuration: row[2] as number,
        clickThroughRate: row[3] as number,
        shares: row[4] as number,
      };
    } catch (error) {
      this.logger.warn(
        `Could not fetch analytics for video ${videoId}: ${error.message}`,
      );
      return {};
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
   * Get YouTube Analytics client
   */
  private getYouTubeAnalyticsClient(
    accessToken: string,
    refreshToken?: string,
  ) {
    const auth = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );

    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.youtubeAnalytics({ version: 'v2', auth });
  }
}
