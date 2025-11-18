# OAuth Setup Guide for Unmotivated Hero

This guide will help you set up OAuth authentication for all supported social media platforms: YouTube (Google), Facebook, Instagram (via Facebook), and TikTok.

## Overview

The platform uses OAuth 2.0 to securely connect user social media accounts. OAuth tokens are encrypted before storage using AES-256 encryption.

## Prerequisites

- Backend and Frontend running locally or deployed
- Admin access to each platform's developer console
- Valid domain/localhost for redirect URIs

## Platform Setup Instructions

### 1. YouTube (via Google OAuth)

#### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable APIs:
   - YouTube Data API v3
   - YouTube Analytics API
   - Google Drive API (for content management)
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User type: External
   - App name: Unmotivated Hero
   - User support email: your email
   - Developer contact: your email
6. Add scopes:
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube.readonly`
   - `https://www.googleapis.com/auth/youtube.force-ssl`
   - `https://www.googleapis.com/auth/drive.readonly`
7. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3001/api/v1/auth/google/callback` (development)
     - `https://your-backend-domain.com/api/v1/auth/google/callback` (production)

#### Configure Backend

Add to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/auth/google/callback
```

---

### 2. Facebook & Instagram (via Facebook OAuth)

#### Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** as app type
4. Fill in app details:
   - App name: Unmotivated Hero
   - Contact email: your email
5. Add Products:
   - **Facebook Login** → Set up
   - **Instagram Basic Display** → Set up
6. Configure Facebook Login:
   - Valid OAuth Redirect URIs:
     - `http://localhost:3001/api/v1/auth/facebook/callback` (development)
     - `https://your-backend-domain.com/api/v1/auth/facebook/callback` (production)
7. Add Required Permissions:
   - `email`
   - `public_profile`
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_insights`

#### Configure Instagram

1. In your Facebook App, go to **Products** → **Instagram** → **Basic Display**
2. Create New App
3. Add Instagram Test Users (for testing)
4. Submit for App Review once ready for production

#### Configure Backend

Add to `backend/.env`:
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:3001/api/v1/auth/facebook/callback
```

---

### 3. TikTok

#### Create TikTok App

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Sign in with your TikTok account
3. Click **Manage Apps** → **Connect an App**
4. Select **Web App**
5. Fill in app details:
   - App name: Unmotivated Hero
   - Category: Social Media Management
6. Configure Login Kit:
   - Redirect URIs:
     - `http://localhost:3001/api/v1/auth/tiktok/callback` (development)
     - `https://your-backend-domain.com/api/v1/auth/tiktok/callback` (production)
7. Add Required Scopes:
   - `user.info.basic`
   - `video.list`
   - `video.upload`
   - `video.publish`
8. Submit for review (TikTok requires app review before going live)

#### Configure Backend

Add to `backend/.env`:
```env
TIKTOK_CLIENT_KEY=your-client-key
TIKTOK_CLIENT_SECRET=your-client-secret
TIKTOK_REDIRECT_URI=http://localhost:3001/api/v1/auth/tiktok/callback
```

---

## Security Configuration

### Encryption Key

The backend uses AES-256 encryption to store OAuth tokens. Set a secure 32-character encryption key:

```env
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

**Important**: Change this in production! Use a cryptographically random string.

### JWT Secret

Set a secure JWT secret for user authentication:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## Frontend Configuration

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
```

---

## Testing OAuth Flow

### 1. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Test Connection Flow

1. Navigate to `http://localhost:3000/connect`
2. Log in to your Unmotivated Hero account
3. Click "Connect" on any platform
4. You'll be redirected to the platform's OAuth consent screen
5. Approve the permissions
6. You'll be redirected back to the app with the account connected

### 3. Verify Connection

Check that the account appears as connected with:
- Account name/username displayed
- Connection date shown
- "Disconnect" button available

---

## OAuth Callback Flow

### How It Works

```
1. User clicks "Connect [Platform]" button
   ↓
2. Frontend redirects to: GET /api/v1/auth/[platform]
   ↓
3. Backend redirects to platform OAuth consent page
   ↓
4. User approves permissions on platform
   ↓
5. Platform redirects to: GET /api/v1/auth/[platform]/callback
   ↓
6. Backend receives OAuth tokens
   ↓
7. Backend redirects to: /auth/callback?platform=...&accountId=...&accessToken=...
   ↓
8. Frontend OAuth callback page receives data
   ↓
9. Frontend calls: POST /api/v1/social/connect
   ↓
10. Backend encrypts and stores tokens in database
   ↓
11. Frontend redirects to: /connect (showing connected status)
```

---

## Common Issues & Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**: Ensure the redirect URI in your OAuth app settings exactly matches the one in your `.env` file, including protocol (http/https) and port.

### Issue: "Invalid client"

**Solution**: Double-check your `CLIENT_ID` and `CLIENT_SECRET` in `.env` are correct.

### Issue: "Insufficient permissions"

**Solution**: Verify all required scopes are added to your OAuth app configuration.

### Issue: "Token encryption failed"

**Solution**: Ensure `ENCRYPTION_KEY` is exactly 32 characters long.

### Issue: "Account not connecting after OAuth approval"

**Solution**:
1. Check browser console for errors
2. Verify backend logs for API call failures
3. Ensure user is logged in before initiating OAuth flow

---

## Production Deployment

### Before Going Live

1. **Update redirect URIs** in all OAuth apps to use your production domain
2. **Change encryption key** - use a cryptographically secure random string
3. **Change JWT secret** - use a different secret than development
4. **Enable HTTPS** - OAuth requires secure connections in production
5. **Submit for app review**:
   - Facebook: Required for Instagram permissions
   - TikTok: Required before going live
   - Google: May require verification depending on scopes
6. **Update CORS settings** in backend to allow your production frontend domain

### Production Environment Variables

```env
# Backend (.env)
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=your-production-database-url
REDIS_HOST=your-production-redis-host
ENCRYPTION_KEY=production-32-char-encryption-key
JWT_SECRET=production-jwt-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-backend.com/api/v1/auth/google/callback
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_REDIRECT_URI=https://your-backend.com/api/v1/auth/facebook/callback
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
TIKTOK_REDIRECT_URI=https://your-backend.com/api/v1/auth/tiktok/callback
```

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
```

---

## Rate Limits & Quotas

Be aware of platform rate limits:

- **YouTube**: 10,000 quota units per day (uploads cost 1,600 units each)
- **Facebook/Instagram**: 200 calls per hour per user
- **TikTok**: Varies by endpoint, typically 100-200 requests per day

Implement proper error handling and retry logic for rate limit errors.

---

## Data Privacy & Compliance

### User Data

- OAuth tokens are encrypted at rest using AES-256
- Tokens are never exposed to frontend
- Users can disconnect accounts at any time
- Disconnecting marks account as inactive but preserves historical data

### GDPR Compliance

If serving EU users:
1. Update privacy policy to explain OAuth data usage
2. Implement data export functionality
3. Implement account deletion (full data removal)
4. Add cookie consent for OAuth session cookies

---

## Support & Resources

- **Google OAuth**: [Documentation](https://developers.google.com/identity/protocols/oauth2)
- **Facebook OAuth**: [Documentation](https://developers.facebook.com/docs/facebook-login)
- **Instagram API**: [Documentation](https://developers.facebook.com/docs/instagram-api)
- **TikTok API**: [Documentation](https://developers.tiktok.com/doc/login-kit-web)

---

## Summary Checklist

- [ ] Created OAuth apps for all platforms
- [ ] Configured redirect URIs
- [ ] Added required scopes/permissions
- [ ] Updated backend `.env` with credentials
- [ ] Updated frontend `.env.local` with API URL
- [ ] Generated secure encryption key (32 characters)
- [ ] Generated secure JWT secret
- [ ] Tested OAuth flow for each platform
- [ ] Verified tokens are encrypted in database
- [ ] Ready for production deployment

---

**Last Updated**: 2025-01-18
**Version**: 1.0.0
