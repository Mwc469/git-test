import { Platform } from '@prisma/client';

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  errorMessage?: string;
}

export interface PublishRequest {
  caption: string;
  contentUrl?: string;
  contentType?: string;
  thumbnailUrl?: string;
  accessToken: string;
  refreshToken?: string;
}

export interface IPublisher {
  platform: Platform;
  publish(request: PublishRequest): Promise<PublishResult>;
  delete(postId: string, accessToken: string): Promise<boolean>;
  update(postId: string, caption: string, accessToken: string): Promise<boolean>;
}
