import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { TikTokAuthGuard } from './guards/tiktok-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SocialService } from '../social/social.service';
import { Platform } from '@prisma/client';
import type { User } from '@prisma/client';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private socialService: SocialService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Google OAuth routes
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const oauthData: any = req.user;

      // For now, redirect to frontend with OAuth data
      // Frontend will need to be logged in first to associate the account
      const params = new URLSearchParams({
        provider: 'google',
        platform: 'YOUTUBE',
        accountId: oauthData.googleId,
        accountName: oauthData.name || oauthData.email,
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken || '',
      });

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/connect?error=google_auth_failed`);
    }
  }

  // Facebook OAuth routes
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookAuth() {
    // Guard redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const oauthData: any = req.user;

      const params = new URLSearchParams({
        provider: 'facebook',
        platform: 'FACEBOOK',
        accountId: oauthData.facebookId,
        accountName: oauthData.name || oauthData.email || 'Facebook User',
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken || '',
      });

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/connect?error=facebook_auth_failed`);
    }
  }

  // TikTok OAuth routes
  @Get('tiktok')
  @UseGuards(TikTokAuthGuard)
  async tiktokAuth() {
    // Guard redirects to TikTok
  }

  @Get('tiktok/callback')
  @UseGuards(TikTokAuthGuard)
  async tiktokAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const oauthData: any = req.user;

      const params = new URLSearchParams({
        provider: 'tiktok',
        platform: 'TIKTOK',
        accountId: oauthData.tiktokId,
        accountName: oauthData.name || 'TikTok User',
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken || '',
      });

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/connect?error=tiktok_auth_failed`);
    }
  }
}
