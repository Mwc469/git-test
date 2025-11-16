import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AnalyticsScheduler {
  private readonly logger = new Logger(AnalyticsScheduler.name);

  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Collect analytics every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleAnalyticsCollection() {
    this.logger.log('Starting scheduled analytics collection...');

    try {
      await this.analyticsService.collectAllAnalytics();
      this.logger.log('Analytics collection completed');
    } catch (error) {
      this.logger.error(`Analytics collection failed: ${error.message}`);
    }
  }

  /**
   * Collect analytics daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAnalyticsCollection() {
    this.logger.log('Starting daily analytics collection...');

    try {
      await this.analyticsService.collectAllAnalytics();
      this.logger.log('Daily analytics collection completed');
    } catch (error) {
      this.logger.error(`Daily analytics collection failed: ${error.message}`);
    }
  }
}
