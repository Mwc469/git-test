import { Controller, Get, Delete, Param, UseGuards, Post, Body } from '@nestjs/common';
import { SocialService, ConnectSocialAccountDto } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Get('accounts')
  async getMyAccounts(@CurrentUser() user: User) {
    return this.socialService.getUserAccounts(user.id);
  }

  @Post('connect')
  async connectAccount(
    @CurrentUser() user: User,
    @Body() dto: Omit<ConnectSocialAccountDto, 'userId'>,
  ) {
    return this.socialService.connectAccount({
      ...dto,
      userId: user.id,
    });
  }

  @Get('accounts/:id')
  async getAccount(@Param('id') id: string) {
    // Note: This returns encrypted tokens for security
    return this.socialService.getAccount(id);
  }

  @Delete('accounts/:id')
  async disconnectAccount(@Param('id') id: string) {
    await this.socialService.disconnectAccount(id);
    return { message: 'Account disconnected successfully' };
  }
}
