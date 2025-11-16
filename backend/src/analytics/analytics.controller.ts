import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('summary')
  async getMySummary(@CurrentUser() user: User) {
    return this.analyticsService.getUserAnalyticsSummary(user.id);
  }

  @Get('post/:postId')
  async getPostAnalytics(@Param('postId') postId: string) {
    return this.analyticsService.getPostAnalytics(postId);
  }

  @Post('collect')
  async collectAll() {
    await this.analyticsService.collectAllAnalytics();
    return { message: 'Analytics collection started' };
  }

  @Post('collect/:postId')
  async collectForPost(@Param('postId') postId: string) {
    await this.analyticsService.collectPostAnalytics(postId);
    return { message: `Analytics collection started for post ${postId}` };
  }
}
