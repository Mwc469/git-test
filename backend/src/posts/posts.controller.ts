import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, PostStatus } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  async createPost(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(user.id, dto);
  }

  @Get()
  async getMyPosts(
    @CurrentUser() user: User,
    @Query('status') status?: PostStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.postsService.getUserPosts(user.id, {
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('stats')
  async getMyStats(@CurrentUser() user: User) {
    return this.postsService.getPostStats(user.id);
  }

  @Get('upcoming')
  async getUpcoming(@CurrentUser() user: User) {
    return this.postsService.getUpcomingPosts(user.id);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsService.getPost(id);
  }

  @Put(':id/caption')
  async updateCaption(@Param('id') id: string, @Body('caption') caption: string) {
    return this.postsService.updateCaption(id, caption);
  }

  @Put(':id/reschedule')
  async reschedule(@Param('id') id: string, @Body('scheduledFor') scheduledFor: string) {
    return this.postsService.reschedulePost(id, new Date(scheduledFor));
  }

  @Post(':id/retry')
  async retry(@Param('id') id: string) {
    return this.postsService.retryPost(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string) {
    return this.postsService.cancelPost(id);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    await this.postsService.deletePost(id);
    return { message: 'Post deleted successfully' };
  }
}
