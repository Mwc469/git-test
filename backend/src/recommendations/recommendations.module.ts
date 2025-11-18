import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsScheduler } from './recommendations.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [RecommendationsService, RecommendationsScheduler],
  controllers: [RecommendationsController],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
