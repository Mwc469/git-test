import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post, PostStatus, Platform } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new scheduled post
   */
  async createPost(userId: string, dto: CreatePostDto): Promise<Post> {
    // Create the main post
    const post = await this.prisma.post.create({
      data: {
        userId,
        contentId: dto.contentId,
        caption: dto.caption,
        scheduledFor: new Date(dto.scheduledFor),
        status: PostStatus.SCHEDULED,
      },
    });

    // Create post-platform relationships
    await Promise.all(
      dto.socialAccountIds.map((accountId) =>
        this.prisma.postPlatform.create({
          data: {
            postId: post.id,
            socialAccountId: accountId,
            status: PostStatus.SCHEDULED,
          },
        }),
      ),
    );

    return this.getPost(post.id);
  }

  /**
   * Get post by ID with all relations
   */
  async getPost(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        content: true,
        platforms: {
          include: {
            socialAccount: true,
          },
        },
      },
    });
  }

  /**
   * Get user's posts
   */
  async getUserPosts(
    userId: string,
    options?: {
      status?: PostStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        userId,
        ...(options?.status && { status: options.status }),
      },
      include: {
        content: true,
        platforms: {
          include: {
            socialAccount: true,
          },
        },
      },
      orderBy: { scheduledFor: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  /**
   * Get posts scheduled for publishing
   */
  async getScheduledPosts(): Promise<Post[]> {
    const now = new Date();
    return this.prisma.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        content: true,
        platforms: {
          where: {
            status: PostStatus.SCHEDULED,
          },
          include: {
            socialAccount: true,
          },
        },
      },
    });
  }

  /**
   * Update post status
   */
  async updatePostStatus(id: string, status: PostStatus): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Update platform post status
   */
  async updatePlatformStatus(
    postPlatformId: string,
    status: PostStatus,
    platformPostId?: string,
    platformUrl?: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.prisma.postPlatform.update({
      where: { id: postPlatformId },
      data: {
        status,
        ...(platformPostId && { platformPostId }),
        ...(platformUrl && { platformUrl }),
        ...(errorMessage && { errorMessage }),
        ...(status === PostStatus.PUBLISHED && { publishedAt: new Date() }),
      },
    });
  }

  /**
   * Mark post as publishing
   */
  async markAsPublishing(postId: string): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.PUBLISHING },
    });
  }

  /**
   * Mark post as published
   */
  async markAsPublished(postId: string): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Mark post as failed
   */
  async markAsFailed(postId: string, errorMessage: string): Promise<void> {
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.FAILED,
        errorMessage,
      },
    });
  }

  /**
   * Retry a failed post
   */
  async retryPost(postId: string): Promise<Post> {
    const post = await this.getPost(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.retryCount >= post.maxRetries) {
      throw new Error('Maximum retry attempts reached');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.SCHEDULED,
        retryCount: { increment: 1 },
        errorMessage: null,
      },
    });
  }

  /**
   * Cancel a scheduled post
   */
  async cancelPost(postId: string): Promise<Post> {
    return this.prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.CANCELLED },
    });
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    await this.prisma.post.delete({
      where: { id: postId },
    });
  }

  /**
   * Update post caption
   */
  async updateCaption(postId: string, caption: string): Promise<Post> {
    return this.prisma.post.update({
      where: { id: postId },
      data: { caption },
    });
  }

  /**
   * Reschedule a post
   */
  async reschedulePost(postId: string, newDateTime: Date): Promise<Post> {
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        scheduledFor: newDateTime,
        status: PostStatus.SCHEDULED,
      },
    });
  }

  /**
   * Get post statistics for a user
   */
  async getPostStats(userId: string) {
    const [total, scheduled, published, failed, cancelled] = await Promise.all([
      this.prisma.post.count({ where: { userId } }),
      this.prisma.post.count({ where: { userId, status: PostStatus.SCHEDULED } }),
      this.prisma.post.count({ where: { userId, status: PostStatus.PUBLISHED } }),
      this.prisma.post.count({ where: { userId, status: PostStatus.FAILED } }),
      this.prisma.post.count({ where: { userId, status: PostStatus.CANCELLED } }),
    ]);

    return {
      total,
      byStatus: {
        scheduled,
        published,
        failed,
        cancelled,
      },
    };
  }

  /**
   * Get upcoming posts (next 7 days)
   */
  async getUpcomingPosts(userId: string): Promise<Post[]> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.post.findMany({
      where: {
        userId,
        status: PostStatus.SCHEDULED,
        scheduledFor: {
          gte: now,
          lte: nextWeek,
        },
      },
      include: {
        content: true,
        platforms: {
          include: {
            socialAccount: true,
          },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    });
  }
}
