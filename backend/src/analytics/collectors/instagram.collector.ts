import { Injectable, Logger } from '@nestjs/common';
import { Platform } from '@prisma/client';
import axios from 'axios';
import {
  IAnalyticsCollector,
  PlatformMetrics,
} from '../interfaces/collector.interface';

@Injectable()
export class InstagramCollector implements IAnalyticsCollector {
  platform = Platform.INSTAGRAM;
  private readonly logger = new Logger(InstagramCollector.name);
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  /**
   * Collect metrics for an Instagram post
   */
  async collectMetrics(
    postId: string,
    accessToken: string,
  ): Promise<PlatformMetrics> {
    try {
      // Get media insights
      const response = await axios.get(`${this.baseUrl}/${postId}/insights`, {
        params: {
          metric:
            'engagement,impressions,reach,saved,video_views,likes,comments,shares',
          access_token: accessToken,
        },
      });

      const insights = response.data.data;

      // Parse insights data
      const metrics: PlatformMetrics = {
        impressions: this.getMetricValue(insights, 'impressions'),
        reach: this.getMetricValue(insights, 'reach'),
        saves: this.getMetricValue(insights, 'saved'),
        views: this.getMetricValue(insights, 'video_views'),
      };

      // Get engagement metrics (likes, comments) separately
      const engagementResponse = await axios.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: 'like_count,comments_count,media_type',
          access_token: accessToken,
        },
      });

      metrics.likes = engagementResponse.data.like_count || 0;
      metrics.comments = engagementResponse.data.comments_count || 0;

      // Calculate engagement rate
      if (metrics.reach && metrics.reach > 0) {
        const totalEngagement =
          (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
        metrics.engagementRate = (totalEngagement / metrics.reach) * 100;
      }

      return metrics;
    } catch (error) {
      this.logger.error(
        `Failed to collect Instagram metrics for ${postId}: ${error.message}`,
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
   * Collect account-level metrics
   */
  async collectAccountMetrics(
    accountId: string,
    accessToken: string,
  ): Promise<{ followersGained?: number; followersLost?: number }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      const response = await axios.get(
        `${this.baseUrl}/${accountId}/insights`,
        {
          params: {
            metric: 'follower_count',
            period: 'day',
            since: Math.floor(startDate.getTime() / 1000),
            until: Math.floor(endDate.getTime() / 1000),
            access_token: accessToken,
          },
        },
      );

      const values = response.data.data[0]?.values || [];
      if (values.length < 2) {
        return {};
      }

      const firstValue = values[0].value;
      const lastValue = values[values.length - 1].value;
      const diff = lastValue - firstValue;

      return {
        followersGained: diff > 0 ? diff : 0,
        followersLost: diff < 0 ? Math.abs(diff) : 0,
      };
    } catch (error) {
      this.logger.warn(
        `Could not fetch account metrics: ${error.message}`,
      );
      return {};
    }
  }
}
