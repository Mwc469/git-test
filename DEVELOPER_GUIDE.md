# Developer Guide

A comprehensive guide for developers working on Unmotivated Hero.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Concepts](#core-concepts)
4. [Adding a New Platform](#adding-a-new-platform)
5. [Database Schema](#database-schema)
6. [Scheduled Jobs](#scheduled-jobs)
7. [Testing](#testing)
8. [Debugging](#debugging)
9. [Best Practices](#best-practices)
10. [Common Patterns](#common-patterns)

---

## Architecture Overview

Unmotivated Hero follows a modular, service-oriented architecture built with NestJS.

### High-Level Architecture

```
┌─────────────────┐
│   Next.js UI    │ (Frontend - Port 3000)
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────────────────────────────┐
│          NestJS Backend                 │ (Port 3001)
│  ┌──────────────────────────────────┐   │
│  │     Controllers Layer            │   │
│  └──────────┬───────────────────────┘   │
│             ▼                            │
│  ┌──────────────────────────────────┐   │
│  │      Services Layer              │   │
│  │  • Auth • Social • Drive         │   │
│  │  • Content • Posts • Publishing  │   │
│  │  • Analytics • Recommendations   │   │
│  └──────────┬───────────────────────┘   │
│             ▼                            │
│  ┌──────────────────────────────────┐   │
│  │      Data Access Layer           │   │
│  │      (Prisma ORM)                │   │
│  └──────────┬───────────────────────┘   │
└─────────────┼───────────────────────────┘
              ▼
    ┌─────────────────┐
    │   PostgreSQL    │ (Port 5432)
    └─────────────────┘

External Services:
├── YouTube API
├── Instagram Graph API
├── Facebook Graph API
├── TikTok API
└── Google Drive API
```

### Key Components

#### 1. **Authentication Module** (`src/auth/`)
- JWT-based authentication
- OAuth2 strategies for each platform
- Token encryption and secure storage
- Passport.js integration

#### 2. **Social Accounts Module** (`src/social/`)
- Manages connected social media accounts
- Stores and refreshes OAuth tokens
- Platform-specific account operations

#### 3. **Google Drive Module** (`src/drive/`)
- Connects to Google Drive folders
- Syncs content automatically
- Detects new files since last sync

#### 4. **Content Module** (`src/content/`)
- Content library management
- Metadata extraction and storage
- Search and filtering capabilities

#### 5. **Posts Module** (`src/posts/`)
- Post creation and scheduling
- Multi-platform targeting
- Status tracking per platform

#### 6. **Publishing Engine** (`src/publishing/`)
- Platform-specific publishers (Strategy pattern)
- Automated scheduled publishing
- Error handling and retry logic
- Rate limit management

#### 7. **Analytics Module** (`src/analytics/`)
- Platform-specific collectors (Strategy pattern)
- Scheduled data collection
- Metrics normalization
- Historical tracking

#### 8. **Recommendations Module** (`src/recommendations/`)
- AI-powered insights generation
- Data-driven suggestions
- Confidence scoring
- Automated weekly generation

---

## Project Structure

```
backend/
├── src/
│   ├── auth/                      # Authentication & OAuth
│   │   ├── strategies/            # Passport strategies
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── google.strategy.ts
│   │   │   ├── facebook.strategy.ts
│   │   │   └── tiktok.strategy.ts
│   │   ├── guards/                # Auth guards
│   │   │   └── jwt-auth.guard.ts
│   │   ├── decorators/            # Custom decorators
│   │   │   └── current-user.decorator.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/                     # User management
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── social/                    # Social accounts
│   │   ├── social.controller.ts
│   │   ├── social.service.ts
│   │   ├── encryption.service.ts  # Token encryption
│   │   └── social.module.ts
│   │
│   ├── drive/                     # Google Drive
│   │   ├── google-drive.service.ts
│   │   ├── drive.service.ts
│   │   ├── drive.controller.ts
│   │   └── drive.module.ts
│   │
│   ├── content/                   # Content library
│   │   ├── content.controller.ts
│   │   ├── content.service.ts
│   │   └── content.module.ts
│   │
│   ├── posts/                     # Posts & scheduling
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   └── posts.module.ts
│   │
│   ├── publishing/                # Publishing engine
│   │   ├── publishers/            # Platform publishers
│   │   │   ├── publisher.interface.ts
│   │   │   ├── youtube.publisher.ts
│   │   │   ├── instagram.publisher.ts
│   │   │   ├── facebook.publisher.ts
│   │   │   └── tiktok.publisher.ts
│   │   ├── publishing.service.ts
│   │   ├── publishing.scheduler.ts
│   │   ├── publishing.controller.ts
│   │   └── publishing.module.ts
│   │
│   ├── analytics/                 # Analytics collection
│   │   ├── collectors/            # Platform collectors
│   │   │   ├── collector.interface.ts
│   │   │   ├── youtube.collector.ts
│   │   │   ├── instagram.collector.ts
│   │   │   ├── facebook.collector.ts
│   │   │   └── tiktok.collector.ts
│   │   ├── analytics.service.ts
│   │   ├── analytics.scheduler.ts
│   │   ├── analytics.controller.ts
│   │   └── analytics.module.ts
│   │
│   ├── recommendations/           # AI recommendations
│   │   ├── recommendations.service.ts
│   │   ├── recommendations.scheduler.ts
│   │   ├── recommendations.controller.ts
│   │   └── recommendations.module.ts
│   │
│   ├── prisma/                    # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   │
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Bootstrap
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
│
├── test/                          # E2E tests
├── .env                           # Environment variables
├── nest-cli.json
├── package.json
└── tsconfig.json

frontend/
├── app/
│   ├── (auth)/                    # Auth pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/                 # Dashboard
│   ├── content/                   # Content library
│   ├── schedule/                  # Posting calendar
│   ├── analytics/                 # Analytics views
│   ├── recommendations/           # AI insights
│   ├── settings/                  # Settings
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                    # Reusable components
│   ├── ui/
│   ├── content/
│   ├── posts/
│   └── analytics/
│
├── lib/                          # Utilities
│   ├── api.ts
│   └── utils.ts
│
└── public/                       # Static assets
```

---

## Core Concepts

### 1. **Strategy Pattern for Publishers**

The publishing system uses the Strategy pattern to support multiple platforms without code duplication.

**Interface**: `backend/src/publishing/publishers/publisher.interface.ts`
```typescript
export interface IPublisher {
  publish(request: PublishRequest): Promise<PublishResult>;
}

export interface PublishRequest {
  caption: string;
  contentUrl: string;
  contentType: string;
  thumbnailUrl?: string;
  accessToken: string;
  refreshToken?: string;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  errorMessage?: string;
}
```

**Implementation Example**: `youtube.publisher.ts`
```typescript
@Injectable()
export class YouTubePublisher implements IPublisher {
  async publish(request: PublishRequest): Promise<PublishResult> {
    // Platform-specific implementation
    const youtube = this.getYouTubeClient(request.accessToken, request.refreshToken);
    const response = await youtube.videos.insert({ /* ... */ });

    return {
      success: true,
      platformPostId: response.data.id,
      platformUrl: `https://www.youtube.com/watch?v=${response.data.id}`,
    };
  }
}
```

### 2. **Strategy Pattern for Analytics Collectors**

Similar pattern for analytics collection:

**Interface**: `backend/src/analytics/collectors/collector.interface.ts`
```typescript
export interface IAnalyticsCollector {
  collectMetrics(postId: string, accessToken: string, refreshToken?: string): Promise<PlatformMetrics>;
}

export interface PlatformMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  // Platform-specific fields...
}
```

### 3. **Scheduled Jobs**

The platform uses `@nestjs/schedule` for automated tasks:

```typescript
@Injectable()
export class PublishingScheduler {
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    await this.publishingService.processScheduledPosts();
  }
}
```

### 4. **OAuth Token Encryption**

All OAuth tokens are encrypted before storage:

```typescript
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

### 5. **Multi-Platform Post Tracking**

Posts are tracked with two levels:
1. **Post**: Overall post entity
2. **PostPlatform**: Per-platform status tracking

```typescript
// Post entity - overall status
const post = {
  id: 'post_123',
  status: 'PUBLISHED', // Overall status
  platforms: [
    {
      platform: 'YOUTUBE',
      status: 'PUBLISHED',  // Platform-specific status
      platformPostId: 'abc123',
    },
    {
      platform: 'INSTAGRAM',
      status: 'FAILED',
      errorMessage: 'Invalid credentials',
    }
  ]
};
```

---

## Adding a New Platform

To add support for a new social media platform (e.g., LinkedIn):

### Step 1: Add Platform to Schema

Edit `backend/prisma/schema.prisma`:

```prisma
enum Platform {
  YOUTUBE
  INSTAGRAM
  FACEBOOK
  TIKTOK
  LINKEDIN  // Add new platform
}
```

Run migration:
```bash
npx prisma migrate dev --name add_linkedin
```

### Step 2: Create OAuth Strategy

Create `backend/src/auth/strategies/linkedin.strategy.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID'),
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET'),
      callbackURL: configService.get<string>('LINKEDIN_REDIRECT_URI'),
      scope: ['r_liteprofile', 'w_member_social'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      platformUserId: profile.id,
      platformUsername: profile.displayName,
      accessToken,
      refreshToken,
    };
  }
}
```

### Step 3: Create Publisher

Create `backend/src/publishing/publishers/linkedin.publisher.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { IPublisher, PublishRequest, PublishResult } from './publisher.interface';
import axios from 'axios';

@Injectable()
export class LinkedInPublisher implements IPublisher {
  private readonly logger = new Logger(LinkedInPublisher.name);

  async publish(request: PublishRequest): Promise<PublishResult> {
    try {
      // LinkedIn-specific publishing logic
      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          author: `urn:li:person:${platformUserId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: request.caption,
              },
              shareMediaCategory: 'VIDEO',
              media: [
                {
                  status: 'READY',
                  media: request.contentUrl,
                },
              ],
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${request.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: true,
        platformPostId: response.data.id,
        platformUrl: `https://www.linkedin.com/feed/update/${response.data.id}`,
      };
    } catch (error) {
      this.logger.error(`Failed to publish to LinkedIn: ${error.message}`);
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }
}
```

### Step 4: Create Analytics Collector

Create `backend/src/analytics/collectors/linkedin.collector.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { IAnalyticsCollector, PlatformMetrics } from './collector.interface';
import axios from 'axios';

@Injectable()
export class LinkedInCollector implements IAnalyticsCollector {
  private readonly logger = new Logger(LinkedInCollector.name);

  async collectMetrics(
    postId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<PlatformMetrics> {
    try {
      const response = await axios.get(
        `https://api.linkedin.com/v2/socialActions/${postId}/(statistics)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const stats = response.data;
      return {
        views: stats.numViews || 0,
        likes: stats.numLikes || 0,
        comments: stats.numComments || 0,
        shares: stats.numShares || 0,
        impressions: stats.numImpressions || 0,
        clickThroughRate: stats.clickThroughRate || 0,
        engagementRate: this.calculateEngagementRate(stats),
      };
    } catch (error) {
      this.logger.error(`Failed to collect LinkedIn metrics: ${error.message}`);
      throw error;
    }
  }

  private calculateEngagementRate(stats: any): number {
    const totalEngagements = (stats.numLikes || 0) + (stats.numComments || 0) + (stats.numShares || 0);
    const impressions = stats.numImpressions || 0;
    return impressions > 0 ? (totalEngagements / impressions) * 100 : 0;
  }
}
```

### Step 5: Register in Modules

Update `backend/src/publishing/publishing.module.ts`:

```typescript
import { LinkedInPublisher } from './publishers/linkedin.publisher';

@Module({
  providers: [
    PublishingService,
    PublishingScheduler,
    YouTubePublisher,
    InstagramPublisher,
    FacebookPublisher,
    TikTokPublisher,
    LinkedInPublisher,  // Add here
  ],
})
export class PublishingModule {}
```

Update `backend/src/publishing/publishing.service.ts`:

```typescript
constructor(
  private youtubePublisher: YouTubePublisher,
  private instagramPublisher: InstagramPublisher,
  private facebookPublisher: FacebookPublisher,
  private tiktokPublisher: TikTokPublisher,
  private linkedinPublisher: LinkedInPublisher,  // Add here
) {
  this.publishers.set(Platform.YOUTUBE, this.youtubePublisher);
  this.publishers.set(Platform.INSTAGRAM, this.instagramPublisher);
  this.publishers.set(Platform.FACEBOOK, this.facebookPublisher);
  this.publishers.set(Platform.TIKTOK, this.tiktokPublisher);
  this.publishers.set(Platform.LINKEDIN, this.linkedinPublisher);  // Add here
}
```

Do the same for `analytics.module.ts` and `analytics.service.ts`.

### Step 6: Add Environment Variables

Add to `.env`:
```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/auth/linkedin/callback
```

### Step 7: Test

```bash
# Restart the server
npm run start:dev

# Test OAuth flow
curl http://localhost:3001/api/v1/auth/linkedin

# Test publishing (after connecting account)
curl -X POST http://localhost:3001/api/v1/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "content_123",
    "caption": "Test post",
    "scheduledFor": "2024-01-25T18:00:00.000Z",
    "socialAccountIds": ["linkedin_account_id"]
  }'
```

---

## Database Schema

### Entity Relationship Diagram

```
User
  ├─── SocialAccounts (1:N)
  ├─── DriveConnections (1:N)
  ├─── Content (1:N)
  ├─── Posts (1:N)
  ├─── PostingRules (1:N)
  └─── Recommendations (1:N)

SocialAccount
  ├─── PostPlatforms (1:N)
  └─── Analytics (1:N)

DriveConnection
  └─── Content (1:N)

Content
  └─── Posts (1:N)

Post
  ├─── PostPlatforms (1:N)
  └─── Analytics (1:N)

PostPlatform
  └─── Analytics (1:N)
```

### Key Models

#### User
- **Purpose**: User accounts
- **Key Fields**: email, password (hashed), name
- **Relations**: Has many social accounts, posts, content

#### SocialAccount
- **Purpose**: Connected platform accounts
- **Key Fields**: platform, platformUserId, accessToken (encrypted), refreshToken (encrypted)
- **Relations**: Belongs to user, has many post platforms

#### Content
- **Purpose**: Media library
- **Key Fields**: title, contentType, fileUrl, metadata
- **Relations**: Belongs to user and drive connection, has many posts

#### Post
- **Purpose**: Scheduled/published posts
- **Key Fields**: caption, scheduledFor, status, publishedAt
- **Relations**: Belongs to user and content, has many post platforms

#### PostPlatform
- **Purpose**: Per-platform post tracking
- **Key Fields**: platform, status, platformPostId, platformUrl
- **Relations**: Belongs to post and social account

#### Analytics
- **Purpose**: Performance metrics
- **Key Fields**: views, likes, comments, shares, engagementRate
- **Relations**: Belongs to post, social account, post platform

#### Recommendation
- **Purpose**: AI-generated insights
- **Key Fields**: type, title, description, confidence, expectedImprovement
- **Relations**: Belongs to user

---

## Scheduled Jobs

### Publishing Scheduler

**File**: `backend/src/publishing/publishing.scheduler.ts`

**Schedule**: Every minute

**Purpose**: Process posts scheduled for publishing

```typescript
@Cron(CronExpression.EVERY_MINUTE)
async handleScheduledPosts() {
  await this.publishingService.processScheduledPosts();
}
```

### Analytics Scheduler

**File**: `backend/src/analytics/analytics.scheduler.ts`

**Schedules**:
- Every 6 hours: Collect recent analytics
- Daily at midnight: Comprehensive collection

```typescript
@Cron(CronExpression.EVERY_6_HOURS)
async handlePeriodicAnalytics() {
  await this.analyticsService.collectRecentAnalytics();
}

@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async handleDailyAnalytics() {
  await this.analyticsService.collectAllAnalytics();
}
```

### Recommendations Scheduler

**File**: `backend/src/recommendations/recommendations.scheduler.ts`

**Schedule**: Weekly (Sunday at midnight)

**Purpose**: Generate fresh recommendations for all users

```typescript
@Cron(CronExpression.EVERY_WEEK)
async handleWeeklyRecommendations() {
  await this.recommendationsService.generateAllRecommendations();
}
```

---

## Testing

### Unit Tests

```typescript
// Example: recommendations.service.spec.ts
describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should generate best time recommendation with sufficient data', async () => {
    jest.spyOn(prisma.analytics, 'findMany').mockResolvedValue(mockAnalytics);

    const recommendation = await service.generateBestTimeRecommendation('user_123');

    expect(recommendation).toBeDefined();
    expect(recommendation.type).toBe(RecommendationType.BEST_TIME);
    expect(recommendation.confidence).toBeGreaterThan(0);
  });

  it('should return null with insufficient data', async () => {
    jest.spyOn(prisma.analytics, 'findMany').mockResolvedValue([]);

    const recommendation = await service.generateBestTimeRecommendation('user_123');

    expect(recommendation).toBeNull();
  });
});
```

### E2E Tests

```typescript
// Example: posts.e2e-spec.ts
describe('Posts (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login and get token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    token = response.body.accessToken;
  });

  it('/posts (POST) should create a new post', () => {
    return request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        contentId: 'content_123',
        caption: 'Test post',
        scheduledFor: '2024-01-25T18:00:00.000Z',
        socialAccountIds: ['account_123'],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.status).toBe('SCHEDULED');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## Debugging

### Enable Debug Logging

In `.env`:
```env
LOG_LEVEL=debug
```

In code:
```typescript
this.logger.debug('Publishing post', { postId, platforms });
```

### Prisma Query Logging

In `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### Debugging OAuth Flows

Add logging in strategies:
```typescript
async validate(accessToken: string, refreshToken: string, profile: any) {
  this.logger.debug('OAuth callback received', {
    profile: profile.id,
    hasRefreshToken: !!refreshToken,
  });
  return { /* ... */ };
}
```

### Debugging Publishing

Check platform-specific error messages:
```typescript
catch (error) {
  this.logger.error(`Publishing failed: ${error.message}`, {
    stack: error.stack,
    response: error.response?.data,
  });
}
```

---

## Best Practices

### 1. **Always Encrypt Sensitive Data**

Never store OAuth tokens in plain text:
```typescript
// ✅ Good
const encryptedToken = this.encryptionService.encrypt(accessToken);
await this.prisma.socialAccount.create({
  data: { accessToken: encryptedToken }
});

// ❌ Bad
await this.prisma.socialAccount.create({
  data: { accessToken }  // Plain text!
});
```

### 2. **Handle Token Expiration**

Always provide refresh token logic:
```typescript
private async getValidToken(account: SocialAccount): Promise<string> {
  if (this.isTokenExpired(account)) {
    return this.refreshToken(account);
  }
  return this.encryptionService.decrypt(account.accessToken);
}
```

### 3. **Use Transactions for Multi-Step Operations**

```typescript
await this.prisma.$transaction(async (tx) => {
  const post = await tx.post.create({ data: postData });
  await tx.postPlatform.createMany({ data: platformData });
  return post;
});
```

### 4. **Implement Proper Error Handling**

```typescript
try {
  await this.publishToYouTube(request);
} catch (error) {
  if (error.code === 401) {
    // Token expired, refresh and retry
    await this.refreshToken(account);
    return this.publishToYouTube(request);
  }
  throw error;
}
```

### 5. **Use DTOs for Validation**

```typescript
// create-post.dto.ts
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  contentId: string;

  @IsString()
  @MaxLength(2000)
  caption: string;

  @IsDateString()
  scheduledFor: string;

  @IsArray()
  @ArrayMinSize(1)
  socialAccountIds: string[];
}
```

### 6. **Log Important Events**

```typescript
this.logger.log(`Post ${postId} published successfully to ${platform}`);
this.logger.warn(`Token expiring soon for account ${accountId}`);
this.logger.error(`Failed to publish: ${error.message}`);
```

---

## Common Patterns

### Pattern 1: Service with External API

```typescript
@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);

  async callAPI(endpoint: string, token: string): Promise<any> {
    try {
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`API call failed: ${error.message}`);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Token expired');
      }
      throw new InternalServerErrorException('API call failed');
    }
  }
}
```

### Pattern 2: Repository Pattern

```typescript
@Injectable()
export class PostsRepository {
  constructor(private prisma: PrismaService) {}

  async findScheduled(now: Date): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledFor: { lte: now },
      },
      include: {
        content: true,
        platforms: {
          include: { socialAccount: true },
        },
      },
    });
  }
}
```

### Pattern 3: Factory Pattern

```typescript
@Injectable()
export class PublisherFactory {
  constructor(
    private youtube: YouTubePublisher,
    private instagram: InstagramPublisher,
  ) {}

  getPublisher(platform: Platform): IPublisher {
    switch (platform) {
      case Platform.YOUTUBE:
        return this.youtube;
      case Platform.INSTAGRAM:
        return this.instagram;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
```

---

## Contributing

When contributing to the project:

1. **Create a feature branch**: `git checkout -b feature/my-feature`
2. **Write tests**: Maintain > 80% code coverage
3. **Follow conventions**: Use existing code style
4. **Update documentation**: Keep docs in sync with code
5. **Run linter**: `npm run lint`
6. **Run tests**: `npm run test`
7. **Create PR**: Include description and screenshots

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [TikTok API](https://developers.tiktok.com)

---

For questions or support, please open an issue on GitHub or contact the development team.
