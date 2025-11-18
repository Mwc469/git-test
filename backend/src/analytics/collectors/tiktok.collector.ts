import { Injectable, Logger } from '@nestjs/common';
import { Platform } from '@prisma/client';
import axios from 'axios';
import {
  IAnalyticsCollector,
  PlatformMetrics,
} from '../interfaces/collector.interface';

@Injectable()
export class TikTokCollector implements IAnalyticsCollector {
  platform = Platform.TIKTOK;
  private readonly logger = new Logger(TikTokCollector.name);
  private readonly baseUrl = 'https://open.tiktokapis.com/v2';

  /**
   * Collect metrics for a TikTok video
   */
  async collectMetrics(
    videoId: string,
    accessToken: string,
  ): Promise<PlatformMetrics> {
    try {
      // Get video info and metrics
      const response = await axios.post(
        `${this.baseUrl}/research/video/query/`,
        {
          filters: {
            video_id: videoId,
          },
          fields: [
            'id',
            'video_description',
            'create_time',
            'region_code',
            'share_count',
            'view_count',
            'like_count',
            'comment_count',
            'music_id',
            'hashtag_names',
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const videoData = response.data.data.videos[0];

      if (!videoData) {
        throw new Error(`Video ${videoId} not found`);
      }

      const metrics: PlatformMetrics = {
        views: videoData.view_count || 0,
        likes: videoData.like_count || 0,
        comments: videoData.comment_count || 0,
        shares: videoData.share_count || 0,
      };

      // Get additional analytics if available
      const analyticsData = await this.getVideoAnalytics(videoId, accessToken);
      if (analyticsData) {
        metrics.reach = analyticsData.reach;
        metrics.completionRate = analyticsData.completionRate;
        metrics.totalPlayTime = analyticsData.totalPlayTime;
        metrics.averageViewDuration = analyticsData.averageViewDuration;
      }

      // Calculate engagement rate
      if (metrics.views && metrics.views > 0) {
        const totalEngagement =
          (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
        metrics.engagementRate = (totalEngagement / metrics.views) * 100;
      }

      return metrics;
    } catch (error) {
      this.logger.error(
        `Failed to collect TikTok metrics for ${videoId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get detailed video analytics
   */
  private async getVideoAnalytics(
    videoId: string,
    accessToken: string,
  ): Promise<Partial<PlatformMetrics> | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/video/list/`,
        {
          params: {
            fields: 'reach,avg_time_watched,full_video_watched_rate,total_time_watched',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const videos = response.data.data.videos;
      const video = videos.find((v: any) => v.id === videoId);

      if (!video) {
        return null;
      }

      return {
        reach: video.reach || 0,
        completionRate: (video.full_video_watched_rate || 0) * 100,
        totalPlayTime: video.total_time_watched || 0,
        averageViewDuration: video.avg_time_watched || 0,
      };
    } catch (error) {
      this.logger.warn(
        `Could not fetch detailed analytics for ${videoId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Collect account-level metrics
   */
  async collectAccountMetrics(
    accessToken: string,
  ): Promise<{ followersGained?: number; profileVisits?: number }> {
    try {
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - 7 * 24 * 60 * 60; // Last 7 days

      const response = await axios.get(
        `${this.baseUrl}/research/user/info/`,
        {
          params: {
            fields: 'follower_count,profile_view_count',
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return {
        profileVisits: response.data.data.profile_view_count || 0,
      };
    } catch (error) {
      this.logger.warn(
        `Could not fetch account metrics: ${error.message}`,
      );
      return {};
    }
  }
}
