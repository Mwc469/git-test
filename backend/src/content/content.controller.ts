import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, ContentType, ContentStatus } from '@prisma/client';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get()
  async getMyContent(
    @CurrentUser() user: User,
    @Query('type') type?: ContentType,
    @Query('status') status?: ContentStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.contentService.getUserContent(user.id, {
      type,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('stats')
  async getMyStats(@CurrentUser() user: User) {
    return this.contentService.getContentStats(user.id);
  }

  @Get('search')
  async searchContent(@CurrentUser() user: User, @Query('q') query: string) {
    return this.contentService.searchContent(user.id, query);
  }

  @Get(':id')
  async getContent(@Param('id') id: string) {
    return this.contentService.getContent(id);
  }

  @Post('sync/:connectionId')
  async syncFromDrive(@Param('connectionId') connectionId: string) {
    return this.contentService.syncFromDrive(connectionId);
  }

  @Delete(':id')
  async deleteContent(@Param('id') id: string) {
    await this.contentService.deleteContent(id);
    return { message: 'Content deleted successfully' };
  }
}
