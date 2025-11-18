import { Injectable, Logger } from '@nestjs/common';
import { Platform } from '@prisma/client';
import axios from 'axios';
import {
  IAnalyticsCollector,
  PlatformMetrics,
} from '../interfaces/collector.interface';

@Injectable()
export class FacebookCollector implements IAnalyticsCollector {
  platform = Platform.FACEBOOK;
  private readonly logger = new Logger(FacebookCollector.name);
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  /**
   * Collect metrics for a Facebook post
   */
  async collectMetrics(
    postId: string,
    accessToken: string,
  ): Promise<PlatformMetrics> {
    try {
      // Get post insights
      const insightsResponse = await axios.get(
        `${this.baseUrl}/${postId}/insights`,
        {
          params: {
            metric:
              'post_impressions,post_impressions_unique,post_engaged_users,post_clicks,post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total,post_reactions_haha_total,post_reactions_sorry_total,post_reactions_anger_total',
            access_token: accessToken,
          },
        },
      );

      const insights = insightsResponse.data.data;

      // Get engagement data
      const engagementResponse = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: 'shares,comments.summary(true)',
          access_token: accessToken,
        },
      });

      const metrics: PlatformMetrics = {
        impressions: this.getMetricValue(insights, 'post_impressions'),
        reach: this.getMetricValue(insights, 'post_impressions_unique'),
        likes: this.getTotalReactions(insights),
        comments: engagementResponse.data.comments?.summary?.total_count || 0,
        shares: engagementResponse.data.shares?.count || 0,
      };

      // Calculate engagement rate
      if (metrics.reach && metrics.reach > 0) {
        const totalEngagement =
          (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
        metrics.engagementRate = (totalEngagement / metrics.reach) * 100;
      }

      return metrics;
    } catch (error) {
      this.logger.error(
        `Failed to collect Facebook metrics for ${postId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get metric value from insights array
   */
  private getMetricValue(insights: any[], metricName: string): number {
    const metric = insights.find((m) => m.name === metricName);
    return metric?.values?.[0]?.value || 0;
  }

  /**
   * Get total reactions (all types)
   */
  private getTotalReactions(insights: any[]): number {
    const reactionTypes = [
      'post_reactions_like_total',
      'post_reactions_love_total',
      'post_reactions_wow_total',
      'post_reactions_haha_total',
      'post_reactions_sorry_total',
      'post_reactions_anger_total',
    ];

    return reactionTypes.reduce((total, type) => {
      return total + this.getMetricValue(insights, type);
    }, 0);
  }

  /**
   * Get video-specific metrics
   */
  async collectVideoMetrics(
    videoId: string,
    accessToken: string,
  ): Promise<Partial<PlatformMetrics>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${videoId}/video_insights`,
        {
          params: {
            metric: 'total_video_views,total_video_views_unique,total_video_complete_views,total_video_avg_time_watched',
            access_token: accessToken,
          },
        },
      );

      const insights = response.data.data;

      return {
        views: this.getMetricValue(insights, 'total_video_views'),
        reach: this.getMetricValue(insights, 'total_video_views_unique'),
        averageViewDuration: this.getMetricValue(
          insights,
          'total_video_avg_time_watched',
        ),
        completionRate:
          (this.getMetricValue(insights, 'total_video_complete_views') /
            this.getMetricValue(insights, 'total_video_views')) *
          100,
      };
    } catch (error) {
      this.logger.warn(
        `Could not fetch video metrics for ${videoId}: ${error.message}`,
      );
      return {};
    }
  }
}
