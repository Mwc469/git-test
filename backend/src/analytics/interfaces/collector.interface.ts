import { Platform } from '@prisma/client';

export interface PlatformMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  watchTime?: number;
  averageViewDuration?: number;
  clickThroughRate?: number;
  impressions?: number;
  reach?: number;
  profileVisits?: number;
  completionRate?: number;
  totalPlayTime?: number;
  engagementRate?: number;
  followersGained?: number;
  followersLost?: number;
}

export interface IAnalyticsCollector {
  platform: Platform;
  collectMetrics(
    postId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<PlatformMetrics>;
}
