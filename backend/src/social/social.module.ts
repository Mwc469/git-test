import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { EncryptionService } from '../common/encryption.service';

@Module({
  providers: [SocialService, EncryptionService],
  controllers: [SocialController],
  exports: [SocialService],
})
export class SocialModule {}
