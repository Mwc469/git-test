import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsScheduler {
  private readonly logger = new Logger(RecommendationsScheduler.name);

  constructor(
    private recommendationsService: RecommendationsService,
    private prisma: PrismaService,
  ) {}

  /**
   * Generate recommendations weekly
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyRecommendations() {
    this.logger.log('Starting weekly recommendations generation...');

    try {
      // Get all users who have published posts
      const users = await this.prisma.user.findMany({
        where: {
          posts: {
            some: {
              status: 'PUBLISHED',
            },
          },
        },
        select: { id: true },
      });

      this.logger.log(`Generating recommendations for ${users.length} users`);

      for (const user of users) {
        try {
          await this.recommendationsService.generateRecommendations(user.id);
        } catch (error) {
          this.logger.error(
            `Failed to generate recommendations for user ${user.id}: ${error.message}`,
          );
        }
      }

      this.logger.log('Weekly recommendations generation completed');
    } catch (error) {
      this.logger.error(
        `Weekly recommendations generation failed: ${error.message}`,
      );
    }
  }
}
