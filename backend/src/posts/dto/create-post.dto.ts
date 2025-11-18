import { IsString, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator';
import { Platform } from '@prisma/client';

export class CreatePostDto {
  @IsOptional()
  @IsUUID()
  contentId?: string;

  @IsString()
  caption: string;

  @IsDateString()
  scheduledFor: string;

  @IsArray()
  platforms: Platform[];

  @IsArray()
  @IsUUID('4', { each: true })
  socialAccountIds: string[];
}
