import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get()
  async getMyRecommendations(@CurrentUser() user: User) {
    return this.recommendationsService.getUserRecommendations(user.id);
  }

  @Post('generate')
  async generate(@CurrentUser() user: User) {
    return this.recommendationsService.generateRecommendations(user.id);
  }

  @Post(':id/apply')
  async apply(@Param('id') id: string) {
    return this.recommendationsService.applyRecommendation(id);
  }

  @Post(':id/dismiss')
  async dismiss(@Param('id') id: string) {
    return this.recommendationsService.dismissRecommendation(id);
  }
}
