import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PublishingService } from './publishing.service';
import { PublishingScheduler } from './publishing.scheduler';
import { YouTubePublisher } from './publishers/youtube.publisher';
import { InstagramPublisher } from './publishers/instagram.publisher';
import { FacebookPublisher } from './publishers/facebook.publisher';
import { TikTokPublisher } from './publishers/tiktok.publisher';
import { PostsModule } from '../posts/posts.module';
import { SocialModule } from '../social/social.module';
import { ContentModule } from '../content/content.module';
import { DriveModule } from '../drive/drive.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PostsModule,
    SocialModule,
    ContentModule,
    DriveModule,
  ],
  providers: [
    PublishingService,
    PublishingScheduler,
    YouTubePublisher,
    InstagramPublisher,
    FacebookPublisher,
    TikTokPublisher,
  ],
  exports: [PublishingService],
})
export class PublishingModule {}
