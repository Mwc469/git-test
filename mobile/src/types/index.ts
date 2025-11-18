// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Social account types
export interface SocialAccount {
  id: string;
  platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
  accountName: string;
  accountId: string;
  isActive: boolean;
  connectedAt: string;
}

// Content types
export interface Content {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'image' | 'text';
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  size: number;
  createdAt: string;
}

// Post types
export interface Post {
  id: string;
  title: string;
  description: string;
  contentId?: string;
  content?: Content;
  scheduledFor?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  platforms: PostPlatform[];
  createdAt: string;
  updatedAt: string;
}

export interface PostPlatform {
  id: string;
  platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
  status: 'pending' | 'publishing' | 'published' | 'failed';
  platformPostId?: string;
  publishedAt?: string;
  error?: string;
}

// Analytics types
export interface Analytics {
  platform: 'youtube' | 'instagram' | 'facebook' | 'tiktok';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  date: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  platformBreakdown: {
    platform: string;
    views: number;
    engagementRate: number;
  }[];
}

// Recommendation types
export interface Recommendation {
  id: string;
  type: 'posting_time' | 'content_strategy' | 'platform_focus';
  title: string;
  description: string;
  confidence: number;
  data: any;
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
