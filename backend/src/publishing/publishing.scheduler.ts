import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PublishingService } from './publishing.service';

@Injectable()
export class PublishingScheduler {
  private readonly logger = new Logger(PublishingScheduler.name);

  constructor(private publishingService: PublishingService) {}

  /**
   * Check for scheduled posts every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    this.logger.debug('Checking for scheduled posts...');

    try {
      await this.publishingService.processScheduledPosts();
    } catch (error) {
      this.logger.error(`Error processing scheduled posts: ${error.message}`);
    }
  }

  /**
   * Check for scheduled posts every 5 minutes (backup)
   * This ensures posts aren't missed if the minute-by-minute check fails
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleScheduledPostsBackup() {
    this.logger.debug('Running backup scheduled posts check...');

    try {
      await this.publishingService.processScheduledPosts();
    } catch (error) {
      this.logger.error(`Error in backup scheduled posts check: ${error.message}`);
    }
  }
}
