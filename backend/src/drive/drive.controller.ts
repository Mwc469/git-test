import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { DriveService } from './drive.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('drive')
@UseGuards(JwtAuthGuard)
export class DriveController {
  constructor(private driveService: DriveService) {}

  @Get('connections')
  async getMyConnections(@CurrentUser() user: User) {
    return this.driveService.getUserConnections(user.id);
  }

  @Get('connections/:id')
  async getConnection(@Param('id') id: string) {
    return this.driveService.getConnection(id);
  }

  @Get('connections/:id/files')
  async listFiles(@Param('id') id: string) {
    return this.driveService.listFolderFiles(id);
  }

  @Get('connections/:id/new-files')
  async getNewFiles(@Param('id') id: string) {
    return this.driveService.getNewFiles(id);
  }

  @Post('connect')
  async connectFolder(
    @CurrentUser() user: User,
    @Body() body: { folderId: string; accessToken: string; refreshToken?: string },
  ) {
    return this.driveService.connectFolder({
      userId: user.id,
      folderId: body.folderId,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken,
    });
  }

  @Delete('connections/:id')
  async disconnectFolder(@Param('id') id: string) {
    await this.driveService.disconnectFolder(id);
    return { message: 'Drive folder disconnected successfully' };
  }
}
