import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import * as stream from 'stream';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdTime: string;
  modifiedTime: string;
}

@Injectable()
export class GoogleDriveService {
  private oauth2Client: any;

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  /**
   * Set credentials for the OAuth2 client
   */
  setCredentials(accessToken: string, refreshToken?: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Get Drive client with authenticated credentials
   */
  private getDriveClient(accessToken: string, refreshToken?: string): drive_v3.Drive {
    const auth = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );

    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.drive({ version: 'v3', auth });
  }

  /**
   * List files in a specific folder
   */
  async listFiles(
    folderId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<DriveFile[]> {
    const drive = this.getDriveClient(accessToken, refreshToken);

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and (mimeType contains 'video' or mimeType contains 'image')`,
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    });

    return response.data.files as DriveFile[];
  }

  /**
   * Get folder metadata
   */
  async getFolderInfo(
    folderId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<{ id: string; name: string }> {
    const drive = this.getDriveClient(accessToken, refreshToken);

    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name',
    });

    return {
      id: response.data.id,
      name: response.data.name,
    };
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(
    fileId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<DriveFile> {
    const drive = this.getDriveClient(accessToken, refreshToken);

    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime, videoMediaMetadata, imageMediaMetadata',
    });

    return response.data as DriveFile;
  }

  /**
   * Download file as buffer
   */
  async downloadFile(
    fileId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<Buffer> {
    const drive = this.getDriveClient(accessToken, refreshToken);

    const response = await drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' },
    );

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      response.data
        .on('data', (chunk: Buffer) => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });
  }

  /**
   * Get file download stream
   */
  async getFileStream(
    fileId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<stream.Readable> {
    const drive = this.getDriveClient(accessToken, refreshToken);

    const response = await drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' },
    );

    return response.data;
  }

  /**
   * Get file thumbnail
   */
  async getFileThumbnail(
    fileId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<string | null> {
    const drive = this.getDriveClient(accessToken, refreshToken);

    const response = await drive.files.get({
      fileId,
      fields: 'thumbnailLink',
    });

    return response.data.thumbnailLink || null;
  }

  /**
   * Check if folder is accessible
   */
  async verifyFolderAccess(
    folderId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<boolean> {
    try {
      await this.getFolderInfo(folderId, accessToken, refreshToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get files modified after a certain date
   */
  async getNewFiles(
    folderId: string,
    afterDate: Date,
    accessToken: string,
    refreshToken?: string,
  ): Promise<DriveFile[]> {
    const drive = this.getDriveClient(accessToken, refreshToken);

    const isoDate = afterDate.toISOString();
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and (mimeType contains 'video' or mimeType contains 'image') and modifiedTime > '${isoDate}'`,
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    return response.data.files as DriveFile[];
  }
}
