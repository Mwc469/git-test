import { Module } from '@nestjs/common';
import { DriveService } from './drive.service';
import { DriveController } from './drive.controller';
import { GoogleDriveService } from './google-drive.service';
import { EncryptionService } from '../common/encryption.service';

@Module({
  providers: [DriveService, GoogleDriveService, EncryptionService],
  controllers: [DriveController],
  exports: [DriveService, GoogleDriveService],
})
export class DriveModule {}
