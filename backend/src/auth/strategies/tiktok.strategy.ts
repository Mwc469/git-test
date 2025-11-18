import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TikTokStrategy extends PassportStrategy(OAuth2Strategy, 'tiktok') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
      clientID: configService.get<string>('TIKTOK_CLIENT_KEY'),
      clientSecret: configService.get<string>('TIKTOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('TIKTOK_REDIRECT_URI'),
      scope: [
        'user.info.basic',
        'video.list',
        'video.upload',
        'video.publish',
      ],
      state: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    // TikTok doesn't return profile in the callback by default
    // We'll need to fetch it using the access token
    const user = {
      tiktokId: profile?.id || 'unknown',
      name: profile?.display_name || 'TikTok User',
      accessToken,
      refreshToken,
    };

    done(null, user);
  }
}
