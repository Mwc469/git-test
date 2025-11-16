import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform, SocialAccount } from '@prisma/client';
import { EncryptionService } from '../common/encryption.service';

export interface ConnectSocialAccountDto {
  userId: string;
  platform: Platform;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

@Injectable()
export class SocialService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async connectAccount(dto: ConnectSocialAccountDto): Promise<SocialAccount> {
    // Encrypt tokens before storing
    const encryptedAccessToken = this.encryptionService.encrypt(dto.accessToken);
    const encryptedRefreshToken = dto.refreshToken
      ? this.encryptionService.encrypt(dto.refreshToken)
      : null;

    // Upsert social account (update if exists, create if not)
    return this.prisma.socialAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: dto.userId,
          platform: dto.platform,
          accountId: dto.accountId,
        },
      },
      update: {
        accountName: dto.accountName,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: dto.tokenExpiry,
        isActive: true,
      },
      create: {
        userId: dto.userId,
        platform: dto.platform,
        accountId: dto.accountId,
        accountName: dto.accountName,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: dto.tokenExpiry,
        isActive: true,
      },
    });
  }

  async getUserAccounts(userId: string): Promise<SocialAccount[]> {
    return this.prisma.socialAccount.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAccount(id: string): Promise<SocialAccount> {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Social account not found');
    }

    return account;
  }

  async getAccountWithDecryptedTokens(id: string): Promise<SocialAccount & {
    decryptedAccessToken: string;
    decryptedRefreshToken?: string;
  }> {
    const account = await this.getAccount(id);

    return {
      ...account,
      decryptedAccessToken: this.encryptionService.decrypt(account.accessToken),
      decryptedRefreshToken: account.refreshToken
        ? this.encryptionService.decrypt(account.refreshToken)
        : undefined,
    };
  }

  async disconnectAccount(id: string): Promise<void> {
    await this.prisma.socialAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateTokens(
    id: string,
    accessToken: string,
    refreshToken?: string,
    tokenExpiry?: Date,
  ): Promise<SocialAccount> {
    const encryptedAccessToken = this.encryptionService.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken
      ? this.encryptionService.encrypt(refreshToken)
      : undefined;

    return this.prisma.socialAccount.update({
      where: { id },
      data: {
        accessToken: encryptedAccessToken,
        ...(encryptedRefreshToken && { refreshToken: encryptedRefreshToken }),
        ...(tokenExpiry && { tokenExpiry }),
      },
    });
  }

  async getUserAccountsByPlatform(
    userId: string,
    platform: Platform,
  ): Promise<SocialAccount[]> {
    return this.prisma.socialAccount.findMany({
      where: {
        userId,
        platform,
        isActive: true,
      },
    });
  }
}
