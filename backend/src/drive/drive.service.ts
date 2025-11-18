import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriveConnection } from '@prisma/client';
import { GoogleDriveService } from './google-drive.service';
import { EncryptionService } from '../common/encryption.service';

export interface ConnectDriveDto {
  userId: string;
  folderId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

@Injectable()
export class DriveService {
  constructor(
    private prisma: PrismaService,
    private googleDriveService: GoogleDriveService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Connect a Google Drive folder
   */
  async connectFolder(dto: ConnectDriveDto): Promise<DriveConnection> {
    // Verify folder access
    const folderInfo = await this.googleDriveService.getFolderInfo(
      dto.folderId,
      dto.accessToken,
      dto.refreshToken,
    );

    if (!folderInfo) {
      throw new BadRequestException('Unable to access the specified folder');
    }

    // Encrypt tokens
    const encryptedAccessToken = this.encryptionService.encrypt(dto.accessToken);
    const encryptedRefreshToken = dto.refreshToken
      ? this.encryptionService.encrypt(dto.refreshToken)
      : null;

    // Create or update drive connection
    return this.prisma.driveConnection.upsert({
      where: {
        userId_folderId: {
          userId: dto.userId,
          folderId: dto.folderId,
        },
      },
      update: {
        folderName: folderInfo.name,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: dto.tokenExpiry,
        isActive: true,
      },
      create: {
        userId: dto.userId,
        folderId: dto.folderId,
        folderName: folderInfo.name,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: dto.tokenExpiry,
        isActive: true,
      },
    });
  }

  /**
   * Get user's drive connections
   */
  async getUserConnections(userId: string): Promise<DriveConnection[]> {
    return this.prisma.driveConnection.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get drive connection by ID
   */
  async getConnection(id: string): Promise<DriveConnection> {
    const connection = await this.prisma.driveConnection.findUnique({
      where: { id },
    });

    if (!connection) {
      throw new NotFoundException('Drive connection not found');
    }

    return connection;
  }

  /**
   * Get connection with decrypted tokens
   */
  async getConnectionWithTokens(id: string): Promise<DriveConnection & {
    decryptedAccessToken: string;
    decryptedRefreshToken?: string;
  }> {
    const connection = await this.getConnection(id);

    return {
      ...connection,
      decryptedAccessToken: this.encryptionService.decrypt(connection.accessToken),
      decryptedRefreshToken: connection.refreshToken
        ? this.encryptionService.decrypt(connection.refreshToken)
        : undefined,
    };
  }

  /**
   * Disconnect a drive folder
   */
  async disconnectFolder(id: string): Promise<void> {
    await this.prisma.driveConnection.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Update last sync time
   */
  async updateLastSync(id: string): Promise<void> {
    await this.prisma.driveConnection.update({
      where: { id },
      data: { lastSync: new Date() },
    });
  }

  /**
   * List files in connected folder
   */
  async listFolderFiles(connectionId: string) {
    const connection = await this.getConnectionWithTokens(connectionId);

    return this.googleDriveService.listFiles(
      connection.folderId,
      connection.decryptedAccessToken,
      connection.decryptedRefreshToken,
    );
  }

  /**
   * Get new files since last sync
   */
  async getNewFiles(connectionId: string) {
    const connection = await this.getConnectionWithTokens(connectionId);

    const afterDate = connection.lastSync || connection.createdAt;

    return this.googleDriveService.getNewFiles(
      connection.folderId,
      afterDate,
      connection.decryptedAccessToken,
      connection.decryptedRefreshToken,
    );
  }

  /**
   * Update tokens for a connection
   */
  async updateTokens(
    id: string,
    accessToken: string,
    refreshToken?: string,
    tokenExpiry?: Date,
  ): Promise<DriveConnection> {
    const encryptedAccessToken = this.encryptionService.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken
      ? this.encryptionService.encrypt(refreshToken)
      : undefined;

    return this.prisma.driveConnection.update({
      where: { id },
      data: {
        accessToken: encryptedAccessToken,
        ...(encryptedRefreshToken && { refreshToken: encryptedRefreshToken }),
        ...(tokenExpiry && { tokenExpiry }),
      },
    });
  }
}
