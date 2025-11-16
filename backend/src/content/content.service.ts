import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Content, ContentType, ContentStatus } from '@prisma/client';
import { DriveService } from '../drive/drive.service';
import { GoogleDriveService, DriveFile } from '../drive/google-drive.service';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private prisma: PrismaService,
    private driveService: DriveService,
    private googleDriveService: GoogleDriveService,
  ) {}

  /**
   * Sync content from a Drive connection
   */
  async syncFromDrive(connectionId: string): Promise<Content[]> {
    this.logger.log(`Starting sync for connection ${connectionId}`);

    const newFiles = await this.driveService.getNewFiles(connectionId);
    const connection = await this.driveService.getConnection(connectionId);

    const syncedContent: Content[] = [];

    for (const file of newFiles) {
      try {
        const content = await this.importFromDrive(connection.userId, connectionId, file);
        syncedContent.push(content);
      } catch (error) {
        this.logger.error(`Failed to import file ${file.id}: ${error.message}`);
      }
    }

    // Update last sync time
    await this.driveService.updateLastSync(connectionId);

    this.logger.log(`Synced ${syncedContent.length} files for connection ${connectionId}`);
    return syncedContent;
  }

  /**
   * Import a single file from Drive
   */
  async importFromDrive(
    userId: string,
    driveConnectionId: string,
    driveFile: DriveFile,
  ): Promise<Content> {
    // Determine content type
    const contentType = this.getContentType(driveFile.mimeType);

    // Check if already imported
    const existing = await this.prisma.content.findUnique({
      where: {
        driveConnectionId_driveFileId: {
          driveConnectionId,
          driveFileId: driveFile.id,
        },
      },
    });

    if (existing) {
      this.logger.log(`File ${driveFile.id} already imported, skipping`);
      return existing;
    }

    // Create content record
    return this.prisma.content.create({
      data: {
        userId,
        driveConnectionId,
        driveFileId: driveFile.id,
        fileName: driveFile.name,
        fileUrl: driveFile.webContentLink || driveFile.webViewLink || '',
        thumbnailUrl: driveFile.thumbnailLink,
        contentType,
        mimeType: driveFile.mimeType,
        fileSize: BigInt(driveFile.size || 0),
        status: ContentStatus.PROCESSED,
        metadata: driveFile,
      },
    });
  }

  /**
   * Get user's content library
   */
  async getUserContent(
    userId: string,
    options?: {
      type?: ContentType;
      status?: ContentStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Content[]> {
    return this.prisma.content.findMany({
      where: {
        userId,
        ...(options?.type && { contentType: options.type }),
        ...(options?.status && { status: options.status }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  /**
   * Get content by ID
   */
  async getContent(id: string): Promise<Content | null> {
    return this.prisma.content.findUnique({
      where: { id },
      include: {
        driveConnection: true,
      },
    });
  }

  /**
   * Delete content
   */
  async deleteContent(id: string): Promise<void> {
    await this.prisma.content.delete({
      where: { id },
    });
  }

  /**
   * Update content status
   */
  async updateStatus(id: string, status: ContentStatus): Promise<Content> {
    return this.prisma.content.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Get content statistics for a user
   */
  async getContentStats(userId: string) {
    const [total, videos, images, pending, processed, failed] = await Promise.all([
      this.prisma.content.count({ where: { userId } }),
      this.prisma.content.count({ where: { userId, contentType: ContentType.VIDEO } }),
      this.prisma.content.count({ where: { userId, contentType: ContentType.IMAGE } }),
      this.prisma.content.count({ where: { userId, status: ContentStatus.PENDING } }),
      this.prisma.content.count({ where: { userId, status: ContentStatus.PROCESSED } }),
      this.prisma.content.count({ where: { userId, status: ContentStatus.FAILED } }),
    ]);

    return {
      total,
      byType: {
        videos,
        images,
      },
      byStatus: {
        pending,
        processed,
        failed,
      },
    };
  }

  /**
   * Determine content type from MIME type
   */
  private getContentType(mimeType: string): ContentType {
    if (mimeType.startsWith('video/')) {
      return ContentType.VIDEO;
    } else if (mimeType.startsWith('image/')) {
      return ContentType.IMAGE;
    }
    return ContentType.IMAGE; // Default
  }

  /**
   * Search content by filename
   */
  async searchContent(userId: string, query: string): Promise<Content[]> {
    return this.prisma.content.findMany({
      where: {
        userId,
        fileName: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
