import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Platform,
  RecommendationType,
  RecommendationStatus,
  Recommendation,
} from '@prisma/client';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate all recommendations for a user
   */
  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    this.logger.log(`Generating recommendations for user ${userId}`);

    const recommendations: Recommendation[] = [];

    // Dismiss old recommendations
    await this.dismissOldRecommendations(userId);

    // Generate different types of recommendations
    const bestTime = await this.generateBestTimeRecommendation(userId);
    if (bestTime) recommendations.push(bestTime);

    const contentType = await this.generateContentTypeRecommendation(userId);
    if (contentType) recommendations.push(contentType);

    const platformFocus = await this.generatePlatformFocusRecommendation(userId);
    if (platformFocus) recommendations.push(platformFocus);

    const postingFrequency = await this.generatePostingFrequencyRecommendation(userId);
    if (postingFrequency) recommendations.push(postingFrequency);

    this.logger.log(`Generated ${recommendations.length} recommendations for user ${userId}`);

    return recommendations;
  }

  /**
   * Generate best posting time recommendation
   */
  private async generateBestTimeRecommendation(
    userId: string,
  ): Promise<Recommendation | null> {
    const analytics = await this.prisma.analytics.findMany({
      where: {
        post: { userId },
      },
      include: {
        post: true,
        socialAccount: true,
      },
      orderBy: { fetchedAt: 'desc' },
      take: 100,
    });

    if (analytics.length < 10) {
      return null; // Not enough data
    }

    // Analyze posting times and engagement
    const timeAnalysis: Record<number, { count: number; avgEngagement: number }> = {};

    for (const data of analytics) {
      if (!data.post.publishedAt) continue;

      const hour = new Date(data.post.publishedAt).getHours();
      const engagement = data.engagementRate || 0;

      if (!timeAnalysis[hour]) {
        timeAnalysis[hour] = { count: 0, avgEngagement: 0 };
      }

      timeAnalysis[hour].count++;
      timeAnalysis[hour].avgEngagement += engagement;
    }

    // Calculate averages
    for (const hour in timeAnalysis) {
      timeAnalysis[hour].avgEngagement /= timeAnalysis[hour].count;
    }

    // Find best times
    const sortedTimes = Object.entries(timeAnalysis)
      .sort((a, b) => b[1].avgEngagement - a[1].avgEngagement)
      .slice(0, 3);

    if (sortedTimes.length === 0) {
      return null;
    }

    const bestHours = sortedTimes.map(([hour]) => hour);
    const avgImprovement =
      sortedTimes[0][1].avgEngagement /
      (Object.values(timeAnalysis).reduce((sum, v) => sum + v.avgEngagement, 0) /
        Object.keys(timeAnalysis).length);

    return this.prisma.recommendation.create({
      data: {
        userId,
        type: RecommendationType.BEST_TIME,
        status: RecommendationStatus.ACTIVE,
        title: 'Optimal Posting Times Identified',
        description: `Based on your past performance, posting at ${this.formatHours(bestHours)} tends to generate ${Math.round((avgImprovement - 1) * 100)}% higher engagement than other times.`,
        confidence: this.calculateConfidence(analytics.length, 10, 100),
        dataPoints: { timeAnalysis, bestHours },
        suggestedAction: {
          action: 'schedule_at_times',
          times: bestHours,
          timezone: 'UTC',
        },
        expectedImprovement: (avgImprovement - 1) * 100,
      },
    });
  }

  /**
   * Generate content type recommendation
   */
  private async generateContentTypeRecommendation(
    userId: string,
  ): Promise<Recommendation | null> {
    const analytics = await this.prisma.analytics.findMany({
      where: {
        post: { userId },
      },
      include: {
        post: {
          include: {
            content: true,
          },
        },
      },
      orderBy: { fetchedAt: 'desc' },
      take: 50,
    });

    if (analytics.length < 10) {
      return null;
    }

    // Analyze content types
    const typeAnalysis: Record<
      string,
      { count: number; avgEngagement: number; avgViews: number }
    > = {};

    for (const data of analytics) {
      const contentType = data.post.content?.contentType || 'TEXT';

      if (!typeAnalysis[contentType]) {
        typeAnalysis[contentType] = { count: 0, avgEngagement: 0, avgViews: 0 };
      }

      typeAnalysis[contentType].count++;
      typeAnalysis[contentType].avgEngagement += data.engagementRate || 0;
      typeAnalysis[contentType].avgViews += data.views || 0;
    }

    // Calculate averages
    for (const type in typeAnalysis) {
      typeAnalysis[type].avgEngagement /= typeAnalysis[type].count;
      typeAnalysis[type].avgViews /= typeAnalysis[type].count;
    }

    // Find best performing type
    const sortedTypes = Object.entries(typeAnalysis).sort(
      (a, b) => b[1].avgEngagement - a[1].avgEngagement,
    );

    if (sortedTypes.length === 0) {
      return null;
    }

    const bestType = sortedTypes[0][0];
    const improvement =
      sortedTypes[0][1].avgEngagement / sortedTypes[sortedTypes.length - 1][1].avgEngagement;

    return this.prisma.recommendation.create({
      data: {
        userId,
        type: RecommendationType.CONTENT_TYPE,
        status: RecommendationStatus.ACTIVE,
        title: `${bestType} Content Performs Best`,
        description: `Your ${bestType.toLowerCase()} content generates ${Math.round((improvement - 1) * 100)}% more engagement than other content types. Consider creating more ${bestType.toLowerCase()} content.`,
        confidence: this.calculateConfidence(analytics.length, 10, 50),
        dataPoints: { typeAnalysis, bestType },
        suggestedAction: {
          action: 'create_more',
          contentType: bestType,
        },
        expectedImprovement: (improvement - 1) * 100,
      },
    });
  }

  /**
   * Generate platform focus recommendation
   */
  private async generatePlatformFocusRecommendation(
    userId: string,
  ): Promise<Recommendation | null> {
    const analytics = await this.prisma.analytics.findMany({
      where: {
        post: { userId },
      },
      include: {
        socialAccount: true,
      },
      orderBy: { fetchedAt: 'desc' },
      take: 100,
    });

    if (analytics.length < 10) {
      return null;
    }

    // Analyze platforms
    const platformAnalysis: Record<
      string,
      {
        count: number;
        avgEngagement: number;
        totalReach: number;
      }
    > = {};

    for (const data of analytics) {
      const platform = data.socialAccount.platform;

      if (!platformAnalysis[platform]) {
        platformAnalysis[platform] = {
          count: 0,
          avgEngagement: 0,
          totalReach: 0,
        };
      }

      platformAnalysis[platform].count++;
      platformAnalysis[platform].avgEngagement += data.engagementRate || 0;
      platformAnalysis[platform].totalReach += data.reach || 0;
    }

    // Calculate averages
    for (const platform in platformAnalysis) {
      platformAnalysis[platform].avgEngagement /= platformAnalysis[platform].count;
    }

    // Find best platform
    const sortedPlatforms = Object.entries(platformAnalysis).sort(
      (a, b) => b[1].avgEngagement - a[1].avgEngagement,
    );

    if (sortedPlatforms.length === 0) {
      return null;
    }

    const bestPlatform = sortedPlatforms[0][0];
    const bestMetrics = sortedPlatforms[0][1];

    return this.prisma.recommendation.create({
      data: {
        userId,
        type: RecommendationType.PLATFORM_FOCUS,
        status: RecommendationStatus.ACTIVE,
        title: `${bestPlatform} Shows Strongest Performance`,
        description: `Your content performs exceptionally well on ${bestPlatform} with an average engagement rate of ${bestMetrics.avgEngagement.toFixed(2)}% and total reach of ${bestMetrics.totalReach.toLocaleString()}. Consider focusing more effort here.`,
        confidence: this.calculateConfidence(analytics.length, 10, 100),
        dataPoints: { platformAnalysis, bestPlatform },
        suggestedAction: {
          action: 'increase_frequency',
          platform: bestPlatform,
        },
        expectedImprovement: 20, // Estimated
      },
    });
  }

  /**
   * Generate posting frequency recommendation
   */
  private async generatePostingFrequencyRecommendation(
    userId: string,
  ): Promise<Recommendation | null> {
    const posts = await this.prisma.post.findMany({
      where: {
        userId,
        status: 'PUBLISHED',
        publishedAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      orderBy: { publishedAt: 'asc' },
    });

    if (posts.length < 5) {
      return null;
    }

    // Calculate current frequency
    const daysSinceFirst =
      (Date.now() - posts[0].publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    const currentFrequency = posts.length / daysSinceFirst; // posts per day

    let recommendation = '';
    let suggestedFrequency = currentFrequency;

    if (currentFrequency < 0.2) {
      // Less than 1 post per 5 days
      recommendation = 'Increase posting frequency to at least 2-3 times per week to build momentum';
      suggestedFrequency = 0.4; // ~3 times per week
    } else if (currentFrequency < 1) {
      // Less than daily
      recommendation = 'Consider posting daily for maximum engagement and growth';
      suggestedFrequency = 1;
    } else {
      recommendation = 'Your posting frequency is good. Maintain consistency for best results';
      suggestedFrequency = currentFrequency;
    }

    return this.prisma.recommendation.create({
      data: {
        userId,
        type: RecommendationType.POSTING_FREQUENCY,
        status: RecommendationStatus.ACTIVE,
        title: 'Posting Frequency Analysis',
        description: `You're currently posting ${(currentFrequency * 7).toFixed(1)} times per week. ${recommendation}.`,
        confidence: this.calculateConfidence(posts.length, 5, 30),
        dataPoints: {
          currentFrequency,
          totalPosts: posts.length,
          daysSinceFirst,
        },
        suggestedAction: {
          action: 'adjust_frequency',
          targetFrequency: suggestedFrequency * 7, // per week
        },
        expectedImprovement: 15, // Estimated
      },
    });
  }

  /**
   * Get active recommendations for a user
   */
  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    return this.prisma.recommendation.findMany({
      where: {
        userId,
        status: RecommendationStatus.ACTIVE,
      },
      orderBy: [{ confidence: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Apply a recommendation
   */
  async applyRecommendation(recommendationId: string): Promise<Recommendation> {
    return this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: RecommendationStatus.APPLIED,
        appliedAt: new Date(),
      },
    });
  }

  /**
   * Dismiss a recommendation
   */
  async dismissRecommendation(recommendationId: string): Promise<Recommendation> {
    return this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: RecommendationStatus.DISMISSED,
        dismissedAt: new Date(),
      },
    });
  }

  /**
   * Dismiss old recommendations (older than 30 days)
   */
  private async dismissOldRecommendations(userId: string): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.prisma.recommendation.updateMany({
      where: {
        userId,
        status: RecommendationStatus.ACTIVE,
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
      data: {
        status: RecommendationStatus.DISMISSED,
        dismissedAt: new Date(),
      },
    });
  }

  /**
   * Calculate confidence score (0-100)
   */
  private calculateConfidence(
    dataPoints: number,
    minRequired: number,
    optimal: number,
  ): number {
    if (dataPoints < minRequired) return 0;
    if (dataPoints >= optimal) return 100;

    return ((dataPoints - minRequired) / (optimal - minRequired)) * 100;
  }

  /**
   * Format hours for display
   */
  private formatHours(hours: string[]): string {
    const formatted = hours.map((h) => {
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}${ampm}`;
    });

    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
    return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
  }
}
