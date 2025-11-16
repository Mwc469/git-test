# Social Media Autopilot Platform

A comprehensive, hands-off social media management platform for bands and content creators. Connect your social accounts, link your Google Drive, set your posting rules, and let the platform handle the rest.

## Features

### Core Capabilities
- **Multi-Platform Publishing**: Automatic posting to YouTube, Instagram, Facebook, and TikTok
- **Google Drive Integration**: Ingest content directly from designated folders
- **Smart Scheduling**: AI-powered posting times based on your audience engagement data
- **Unified Analytics**: Centralized performance tracking across all platforms
- **AI Recommendations**: Data-driven suggestions for content strategy optimization
- **Automated Workflows**: Set rules once, let the platform manage posting schedules

### Platform Support
- **YouTube**: Video uploads, metadata management, analytics tracking
- **Instagram**: Posts, Reels, Stories with engagement metrics
- **Facebook**: Page posts, video content, comprehensive insights
- **TikTok**: Video publishing with performance analytics

### Intelligence Features
- Best posting time recommendations
- Content type performance analysis
- Engagement rate optimization
- Platform-specific strategy insights
- Follower growth tracking
- Automatic content scheduling

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Queue**: Redis + BullMQ
- **Authentication**: Passport.js (OAuth2)

### Frontend
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload enabled

## Project Structure

```
.
├── backend/               # NestJS API server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/     # Authentication & OAuth
│   │   │   ├── users/    # User management
│   │   │   ├── social/   # Social platform integrations
│   │   │   ├── drive/    # Google Drive integration
│   │   │   ├── content/  # Content management
│   │   │   ├── posts/    # Post scheduling & publishing
│   │   │   ├── analytics/# Analytics collection
│   │   │   └── ai/       # Recommendation engine
│   │   ├── common/       # Shared utilities
│   │   └── main.ts
│   └── prisma/
│       └── schema.prisma # Database schema
├── frontend/             # Next.js application
│   ├── app/
│   │   ├── dashboard/   # Main dashboard
│   │   ├── content/     # Content library
│   │   ├── schedule/    # Posting calendar
│   │   ├── analytics/   # Performance reports
│   │   └── settings/    # Configuration
│   └── components/      # Reusable UI components
├── docker/              # Docker configurations
└── docs/                # Documentation

```

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- Docker and Docker Compose
- Google Cloud Console account (for OAuth)
- Meta Developer account (for Facebook/Instagram)
- TikTok Developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd git-test
   ```

2. **Start the infrastructure**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL on port 5432
   - Redis on port 6379

3. **Backend setup**
   ```bash
   cd backend
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your OAuth credentials

   # Run database migrations
   npx prisma migrate dev

   # Generate Prisma client
   npx prisma generate

   # Start development server
   npm run start:dev
   ```

4. **Frontend setup**
   ```bash
   cd frontend
   npm install

   # Start development server
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

### Environment Configuration

#### Backend (.env)
See `backend/.env.example` for all required environment variables.

Key configuration:
- **Database**: PostgreSQL connection string
- **OAuth Credentials**:
  - Google (YouTube + Drive)
  - Facebook/Meta (Facebook + Instagram)
  - TikTok
- **JWT**: Secret key for authentication
- **Encryption**: Key for securing OAuth tokens

### OAuth Setup Guide

#### Google (YouTube + Drive)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs: YouTube Data API v3, Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Secret to `.env`

#### Facebook/Meta (Facebook + Instagram)
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login and Instagram Basic Display
4. Configure OAuth redirect: `http://localhost:3000/auth/facebook/callback`
5. Copy App ID and Secret to `.env`

#### TikTok
1. Go to [TikTok Developers](https://developers.tiktok.com)
2. Create a new app
3. Request access to Content Posting API
4. Configure redirect URI: `http://localhost:3000/auth/tiktok/callback`
5. Copy Client Key and Secret to `.env`

## Database Schema

The platform uses a comprehensive PostgreSQL schema:

- **Users**: User accounts and authentication
- **SocialAccounts**: Connected platform accounts with OAuth tokens
- **DriveConnections**: Linked Google Drive folders
- **Content**: Media files ingested from Drive
- **Posts**: Scheduled and published content
- **PostPlatforms**: Cross-platform publishing tracking
- **Analytics**: Performance metrics from all platforms
- **PostingRules**: User-defined automation rules
- **Recommendations**: AI-generated insights

See `backend/prisma/schema.prisma` for complete details.

## Documentation

Comprehensive documentation is available:
- **[Setup Guide](./SETUP.md)**: Step-by-step installation and configuration
- **[API Documentation](./API_DOCUMENTATION.md)**: Complete API reference with examples
- **[Developer Guide](./DEVELOPER_GUIDE.md)**: Architecture, patterns, and extending the platform

Once the backend is running, interactive API docs are available at:
- Swagger UI: http://localhost:3001/api/docs
- OpenAPI JSON: http://localhost:3001/api/docs-json

## Development Workflow

### Database Changes
```bash
cd backend

# Create a new migration
npx prisma migrate dev --name description_of_change

# Generate Prisma client after schema changes
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

### Running Tests
```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format
```

## Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

### Environment Variables
Ensure all production environment variables are set:
- Secure JWT_SECRET
- Production OAuth redirect URIs
- Proper DATABASE_URL
- Strong ENCRYPTION_KEY

## Architecture Highlights

### Publishing Engine
- BullMQ job queue for reliable scheduling
- Retry logic with exponential backoff
- Platform-specific adapters
- Rate limit handling
- Error recovery

### Analytics Collection
- Scheduled jobs to fetch platform metrics
- Data normalization across platforms
- Historical tracking
- Engagement rate calculations

### AI Recommendations
- Analyzes historical performance
- Identifies optimal posting times
- Suggests content strategies
- Predicts engagement potential

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Your chosen license]

## Support

For issues and questions:
- GitHub Issues: [repository]/issues
- Documentation: `/docs`

## Roadmap

- [x] **Phase 1**: Core infrastructure ✅
- [x] **Phase 2**: OAuth integrations (Google, Facebook, TikTok) ✅
- [x] **Phase 3**: Google Drive sync ✅
- [x] **Phase 4**: Content management ✅
- [x] **Phase 5**: Multi-platform publishing ✅
- [x] **Phase 6**: Analytics collection ✅
- [x] **Phase 7**: AI recommendation engine ✅
- [ ] **Phase 8**: Dashboard UI (Next.js frontend)
- [ ] **Phase 9**: Mobile app
- [ ] **Phase 10**: Advanced analytics & A/B testing
