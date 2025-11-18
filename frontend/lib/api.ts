/**
 * API Client for Unmotivated Hero
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface SocialAccount {
  id: string;
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK';
  platformUserId: string;
  platformUsername: string;
  isActive: boolean;
  connectedAt: string;
  lastUsedAt?: string;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'IMAGE' | 'TEXT';
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  caption: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  scheduledFor: string;
  publishedAt?: string;
  content: Content;
  platforms: PostPlatform[];
  createdAt: string;
}

export interface PostPlatform {
  id: string;
  platform: string;
  status: string;
  platformPostId?: string;
  platformUrl?: string;
  socialAccount: {
    platformUsername: string;
  };
}

export interface Analytics {
  postId: string;
  platforms: PlatformAnalytics[];
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    averageEngagementRate: number;
  };
}

export interface PlatformAnalytics {
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  fetchedAt: string;
}

export interface Recommendation {
  id: string;
  type: 'BEST_TIME' | 'CONTENT_TYPE' | 'PLATFORM_FOCUS' | 'POSTING_FREQUENCY';
  status: 'ACTIVE' | 'APPLIED' | 'DISMISSED';
  title: string;
  description: string;
  confidence: number;
  expectedImprovement: number;
  dataPoints: any;
  suggestedAction: any;
  createdAt: string;
}

export interface AnalyticsSummary {
  period: string;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagementRate: number;
  byPlatform: Record<string, any>;
  topPosts: any[];
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Social accounts endpoints
  async getSocialAccounts(): Promise<SocialAccount[]> {
    return this.request<SocialAccount[]>('/social/accounts');
  }

  async disconnectAccount(accountId: string): Promise<void> {
    return this.request<void>(`/social/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // Content endpoints
  async getContent(params?: { page?: number; limit?: number; search?: string }): Promise<{ content: Content[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/content?${query}`);
  }

  async getContentById(id: string): Promise<Content> {
    return this.request<Content>(`/content/${id}`);
  }

  async deleteContent(id: string): Promise<void> {
    return this.request<void>(`/content/${id}`, { method: 'DELETE' });
  }

  // Posts endpoints
  async getPosts(params?: { status?: string; page?: number; limit?: number }): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/posts?${query}`);
  }

  async getPostById(id: string): Promise<Post> {
    return this.request<Post>(`/posts/${id}`);
  }

  async createPost(data: {
    contentId: string;
    caption: string;
    scheduledFor: string;
    socialAccountIds: string[];
  }): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string): Promise<void> {
    return this.request<void>(`/posts/${id}`, { method: 'DELETE' });
  }

  // Analytics endpoints
  async getAnalyticsSummary(period: string = '30d'): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>(`/analytics/summary?period=${period}`);
  }

  async getPostAnalytics(postId: string): Promise<Analytics> {
    return this.request<Analytics>(`/analytics/posts/${postId}`);
  }

  // Recommendations endpoints
  async getRecommendations(): Promise<{ recommendations: Recommendation[] }> {
    return this.request<{ recommendations: Recommendation[] }>('/recommendations');
  }

  async generateRecommendations(): Promise<any> {
    return this.request<any>('/recommendations/generate', {
      method: 'POST',
    });
  }

  async applyRecommendation(id: string): Promise<Recommendation> {
    return this.request<Recommendation>(`/recommendations/${id}/apply`, {
      method: 'POST',
    });
  }

  async dismissRecommendation(id: string): Promise<Recommendation> {
    return this.request<Recommendation>(`/recommendations/${id}/dismiss`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
