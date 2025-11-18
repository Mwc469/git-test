import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsScheduler } from './analytics.scheduler';
import { YouTubeCollector } from './collectors/youtube.collector';
import { InstagramCollector } from './collectors/instagram.collector';
import { FacebookCollector } from './collectors/facebook.collector';
import { TikTokCollector } from './collectors/tiktok.collector';
import { PostsModule } from '../posts/posts.module';
import { SocialModule } from '../social/social.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PostsModule,
    SocialModule,
  ],
  providers: [
    AnalyticsService,
    AnalyticsScheduler,
    YouTubeCollector,
    InstagramCollector,
    FacebookCollector,
    TikTokCollector,
  ],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
