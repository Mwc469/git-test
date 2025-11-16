# API Documentation

Complete API reference for the Social Media Autopilot Platform.

**Base URL**: `http://localhost:3001/api/v1`

**Authentication**: Most endpoints require a JWT bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Social Accounts](#social-accounts)
4. [Google Drive](#google-drive)
5. [Content](#content)
6. [Posts](#posts)
7. [Publishing](#publishing)
8. [Analytics](#analytics)
9. [Recommendations](#recommendations)
10. [Posting Rules](#posting-rules)

---

## Authentication

### Register

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response**: `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Login

Authenticate an existing user.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm1a2b3c4d5e6f7g8h9i0j1k",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### OAuth Flows

#### Google OAuth (YouTube + Drive)

**Step 1**: Redirect user to Google authorization
```
GET /auth/google
```

**Step 2**: Google redirects back to:
```
GET /auth/google/callback?code=<authorization_code>
```

**Response**: User is redirected to frontend with JWT token

#### Facebook OAuth (Facebook + Instagram)

**Step 1**: Redirect user to Facebook authorization
```
GET /auth/facebook
```

**Step 2**: Facebook redirects back to:
```
GET /auth/facebook/callback?code=<authorization_code>
```

**Response**: User is redirected to frontend with JWT token

#### TikTok OAuth

**Step 1**: Redirect user to TikTok authorization
```
GET /auth/tiktok
```

**Step 2**: TikTok redirects back to:
```
GET /auth/tiktok/callback?code=<authorization_code>
```

**Response**: User is redirected to frontend with JWT token

---

## Users

### Get Current User

Get the authenticated user's profile.

**Endpoint**: `GET /users/me`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "cm1a2b3c4d5e6f7g8h9i0j1k",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Update User Profile

Update user information.

**Endpoint**: `PATCH /users/me`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response**: `200 OK`
```json
{
  "id": "cm1a2b3c4d5e6f7g8h9i0j1k",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "updatedAt": "2024-01-16T14:20:00.000Z"
}
```

---

## Social Accounts

### List Connected Accounts

Get all social media accounts connected by the user.

**Endpoint**: `GET /social/accounts`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
[
  {
    "id": "acc_youtube_123",
    "platform": "YOUTUBE",
    "platformUserId": "UC1234567890",
    "platformUsername": "MyBandChannel",
    "isActive": true,
    "connectedAt": "2024-01-15T11:00:00.000Z",
    "lastUsedAt": "2024-01-20T09:30:00.000Z"
  },
  {
    "id": "acc_instagram_456",
    "platform": "INSTAGRAM",
    "platformUserId": "12345678",
    "platformUsername": "my_band_official",
    "isActive": true,
    "connectedAt": "2024-01-15T11:05:00.000Z",
    "lastUsedAt": "2024-01-19T15:45:00.000Z"
  }
]
```

### Get Account Details

Get details for a specific social account.

**Endpoint**: `GET /social/accounts/:accountId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "acc_youtube_123",
  "platform": "YOUTUBE",
  "platformUserId": "UC1234567890",
  "platformUsername": "MyBandChannel",
  "isActive": true,
  "connectedAt": "2024-01-15T11:00:00.000Z",
  "lastUsedAt": "2024-01-20T09:30:00.000Z"
}
```

### Disconnect Account

Remove a connected social media account.

**Endpoint**: `DELETE /social/accounts/:accountId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

### Refresh Account Tokens

Manually refresh OAuth tokens for an account.

**Endpoint**: `POST /social/accounts/:accountId/refresh`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Tokens refreshed successfully"
}
```

---

## Google Drive

### List Drive Connections

Get all Google Drive folder connections.

**Endpoint**: `GET /drive/connections`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
[
  {
    "id": "drive_conn_123",
    "folderId": "1a2b3c4d5e6f7g8h9i0j",
    "folderName": "Band Content",
    "isActive": true,
    "lastSyncedAt": "2024-01-20T10:00:00.000Z",
    "connectedAt": "2024-01-15T12:00:00.000Z"
  }
]
```

### Connect Drive Folder

Link a Google Drive folder for content ingestion.

**Endpoint**: `POST /drive/connect`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "folderId": "1a2b3c4d5e6f7g8h9i0j",
  "folderName": "Band Content",
  "accessToken": "<google-access-token>",
  "refreshToken": "<google-refresh-token>"
}
```

**Response**: `201 Created`
```json
{
  "id": "drive_conn_123",
  "folderId": "1a2b3c4d5e6f7g8h9i0j",
  "folderName": "Band Content",
  "isActive": true,
  "connectedAt": "2024-01-20T14:30:00.000Z"
}
```

### Sync Drive Folder

Manually trigger a sync to import new content.

**Endpoint**: `POST /drive/connections/:connectionId/sync`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "syncedFiles": 5,
  "newContent": [
    {
      "id": "content_123",
      "title": "New Music Video.mp4",
      "contentType": "VIDEO"
    }
  ],
  "syncedAt": "2024-01-20T15:00:00.000Z"
}
```

### Get Drive Files

List files in a connected Drive folder.

**Endpoint**: `GET /drive/connections/:connectionId/files`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "files": [
    {
      "id": "drive_file_123",
      "name": "Concert Footage.mp4",
      "mimeType": "video/mp4",
      "size": 52428800,
      "webViewLink": "https://drive.google.com/file/d/...",
      "thumbnailLink": "https://drive.google.com/thumbnail?id=...",
      "createdTime": "2024-01-18T09:00:00.000Z",
      "modifiedTime": "2024-01-18T09:00:00.000Z"
    }
  ]
}
```

### Disconnect Drive Folder

Remove a Drive folder connection.

**Endpoint**: `DELETE /drive/connections/:connectionId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

---

## Content

### List All Content

Get all content in the user's library.

**Endpoint**: `GET /content`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `contentType` (optional): Filter by type (`VIDEO`, `IMAGE`, `TEXT`)
- `search` (optional): Search by title
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**: `200 OK`
```json
{
  "content": [
    {
      "id": "content_123",
      "title": "New Music Video",
      "description": "Behind the scenes footage",
      "contentType": "VIDEO",
      "mimeType": "video/mp4",
      "fileSize": 52428800,
      "fileUrl": "https://drive.google.com/file/d/...",
      "thumbnailUrl": "https://drive.google.com/thumbnail?id=...",
      "driveConnectionId": "drive_conn_123",
      "createdAt": "2024-01-18T09:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
```

### Get Content Details

Get details for a specific content item.

**Endpoint**: `GET /content/:contentId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "content_123",
  "title": "New Music Video",
  "description": "Behind the scenes footage",
  "contentType": "VIDEO",
  "mimeType": "video/mp4",
  "fileSize": 52428800,
  "fileUrl": "https://drive.google.com/file/d/...",
  "thumbnailUrl": "https://drive.google.com/thumbnail?id=...",
  "driveConnectionId": "drive_conn_123",
  "metadata": {
    "duration": 245,
    "width": 1920,
    "height": 1080
  },
  "posts": [
    {
      "id": "post_123",
      "scheduledFor": "2024-01-25T18:00:00.000Z",
      "status": "SCHEDULED"
    }
  ],
  "createdAt": "2024-01-18T09:00:00.000Z"
}
```

### Update Content

Update content metadata.

**Endpoint**: `PATCH /content/:contentId`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "metadata": {
    "tags": ["rock", "live", "2024"]
  }
}
```

**Response**: `200 OK`
```json
{
  "id": "content_123",
  "title": "Updated Title",
  "description": "Updated description",
  "updatedAt": "2024-01-20T16:00:00.000Z"
}
```

### Delete Content

Remove content from the library.

**Endpoint**: `DELETE /content/:contentId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

### Get Content Statistics

Get statistics about the user's content library.

**Endpoint**: `GET /content/stats`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "totalContent": 45,
  "byType": {
    "VIDEO": 30,
    "IMAGE": 15,
    "TEXT": 0
  },
  "totalSize": 2147483648,
  "recentlyAdded": 8
}
```

---

## Posts

### List All Posts

Get all scheduled and published posts.

**Endpoint**: `GET /posts`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by status (`DRAFT`, `SCHEDULED`, `PUBLISHING`, `PUBLISHED`, `FAILED`)
- `platform` (optional): Filter by platform
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response**: `200 OK`
```json
{
  "posts": [
    {
      "id": "post_123",
      "caption": "Check out our new music video! 🎸",
      "status": "SCHEDULED",
      "scheduledFor": "2024-01-25T18:00:00.000Z",
      "content": {
        "id": "content_123",
        "title": "New Music Video",
        "thumbnailUrl": "https://..."
      },
      "platforms": [
        {
          "id": "pp_123",
          "platform": "YOUTUBE",
          "status": "SCHEDULED",
          "socialAccount": {
            "platformUsername": "MyBandChannel"
          }
        },
        {
          "id": "pp_124",
          "platform": "INSTAGRAM",
          "status": "SCHEDULED",
          "socialAccount": {
            "platformUsername": "my_band_official"
          }
        }
      ],
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ],
  "total": 12,
  "page": 1,
  "totalPages": 1
}
```

### Get Post Details

Get details for a specific post.

**Endpoint**: `GET /posts/:postId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "post_123",
  "caption": "Check out our new music video! 🎸",
  "status": "PUBLISHED",
  "scheduledFor": "2024-01-25T18:00:00.000Z",
  "publishedAt": "2024-01-25T18:00:15.000Z",
  "content": {
    "id": "content_123",
    "title": "New Music Video",
    "contentType": "VIDEO",
    "fileUrl": "https://...",
    "thumbnailUrl": "https://..."
  },
  "platforms": [
    {
      "id": "pp_123",
      "platform": "YOUTUBE",
      "status": "PUBLISHED",
      "platformPostId": "dQw4w9WgXcQ",
      "platformUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "publishedAt": "2024-01-25T18:00:15.000Z",
      "socialAccount": {
        "platformUsername": "MyBandChannel"
      }
    }
  ],
  "createdAt": "2024-01-20T10:00:00.000Z"
}
```

### Create Post

Schedule a new post across multiple platforms.

**Endpoint**: `POST /posts`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "contentId": "content_123",
  "caption": "Check out our new music video! 🎸 #rock #newmusic",
  "scheduledFor": "2024-01-25T18:00:00.000Z",
  "socialAccountIds": [
    "acc_youtube_123",
    "acc_instagram_456",
    "acc_facebook_789"
  ]
}
```

**Response**: `201 Created`
```json
{
  "id": "post_123",
  "caption": "Check out our new music video! 🎸 #rock #newmusic",
  "status": "SCHEDULED",
  "scheduledFor": "2024-01-25T18:00:00.000Z",
  "platforms": [
    {
      "id": "pp_123",
      "platform": "YOUTUBE",
      "status": "SCHEDULED"
    },
    {
      "id": "pp_124",
      "platform": "INSTAGRAM",
      "status": "SCHEDULED"
    },
    {
      "id": "pp_125",
      "platform": "FACEBOOK",
      "status": "SCHEDULED"
    }
  ],
  "createdAt": "2024-01-20T16:30:00.000Z"
}
```

### Update Post

Modify a scheduled post.

**Endpoint**: `PATCH /posts/:postId`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "caption": "Updated caption with new hashtags #music",
  "scheduledFor": "2024-01-26T20:00:00.000Z"
}
```

**Response**: `200 OK`
```json
{
  "id": "post_123",
  "caption": "Updated caption with new hashtags #music",
  "scheduledFor": "2024-01-26T20:00:00.000Z",
  "updatedAt": "2024-01-21T09:00:00.000Z"
}
```

### Delete Post

Cancel and delete a post.

**Endpoint**: `DELETE /posts/:postId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

**Note**: Only works for posts with status `DRAFT` or `SCHEDULED`. Published posts cannot be deleted (but can be removed from platforms manually).

---

## Publishing

### Process Scheduled Posts

Manually trigger the publishing process (normally runs automatically every minute).

**Endpoint**: `POST /publishing/process`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "processed": 3,
  "successful": 2,
  "failed": 1,
  "posts": [
    {
      "postId": "post_123",
      "status": "PUBLISHED",
      "platforms": {
        "YOUTUBE": "success",
        "INSTAGRAM": "success"
      }
    }
  ]
}
```

### Publish Single Post

Immediately publish a specific post (bypasses schedule).

**Endpoint**: `POST /publishing/posts/:postId/publish`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "postId": "post_123",
  "status": "PUBLISHED",
  "publishedAt": "2024-01-21T10:15:00.000Z",
  "platforms": [
    {
      "platform": "YOUTUBE",
      "status": "PUBLISHED",
      "platformPostId": "dQw4w9WgXcQ",
      "platformUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      "platform": "INSTAGRAM",
      "status": "PUBLISHED",
      "platformPostId": "3123456789012345678",
      "platformUrl": "https://www.instagram.com/p/ABC123/"
    }
  ]
}
```

### Retry Failed Platform

Retry publishing to a specific platform that failed.

**Endpoint**: `POST /publishing/posts/:postId/retry/:platformId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "platform": "TIKTOK",
  "status": "PUBLISHED",
  "platformPostId": "7123456789012345678",
  "platformUrl": "https://www.tiktok.com/@user/video/7123456789012345678"
}
```

---

## Analytics

### Get Post Analytics

Get analytics for a specific post across all platforms.

**Endpoint**: `GET /analytics/posts/:postId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "postId": "post_123",
  "platforms": [
    {
      "platform": "YOUTUBE",
      "views": 12500,
      "likes": 450,
      "comments": 67,
      "shares": 23,
      "watchTime": 3600000,
      "averageViewDuration": 180,
      "clickThroughRate": 4.2,
      "engagementRate": 3.6,
      "fetchedAt": "2024-01-26T08:00:00.000Z"
    },
    {
      "platform": "INSTAGRAM",
      "views": 8200,
      "likes": 890,
      "comments": 45,
      "shares": 67,
      "saves": 123,
      "reach": 15000,
      "impressions": 22000,
      "engagementRate": 10.9,
      "fetchedAt": "2024-01-26T08:00:00.000Z"
    }
  ],
  "totals": {
    "views": 20700,
    "likes": 1340,
    "comments": 112,
    "shares": 90,
    "averageEngagementRate": 7.25
  }
}
```

### Get User Analytics Summary

Get overall analytics summary for the user.

**Endpoint**: `GET /analytics/summary`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `period` (optional): Time period (`7d`, `30d`, `90d`, `all`) - default: `30d`

**Response**: `200 OK`
```json
{
  "period": "30d",
  "totalPosts": 12,
  "totalViews": 156000,
  "totalLikes": 8900,
  "totalComments": 567,
  "totalShares": 234,
  "averageEngagementRate": 5.7,
  "byPlatform": {
    "YOUTUBE": {
      "posts": 5,
      "views": 89000,
      "likes": 3200,
      "avgEngagementRate": 3.6
    },
    "INSTAGRAM": {
      "posts": 7,
      "views": 45000,
      "likes": 4500,
      "avgEngagementRate": 10.0
    },
    "FACEBOOK": {
      "posts": 5,
      "views": 22000,
      "likes": 1200,
      "avgEngagementRate": 5.5
    }
  },
  "topPosts": [
    {
      "postId": "post_123",
      "title": "New Music Video",
      "views": 25000,
      "engagementRate": 12.5
    }
  ]
}
```

### Collect Analytics

Manually trigger analytics collection for a post.

**Endpoint**: `POST /analytics/posts/:postId/collect`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "postId": "post_123",
  "collected": 2,
  "platforms": ["YOUTUBE", "INSTAGRAM"],
  "collectedAt": "2024-01-21T11:00:00.000Z"
}
```

### Get Analytics History

Get historical analytics data for a post.

**Endpoint**: `GET /analytics/posts/:postId/history`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "postId": "post_123",
  "history": [
    {
      "fetchedAt": "2024-01-25T18:00:00.000Z",
      "platform": "YOUTUBE",
      "views": 1200,
      "likes": 45,
      "comments": 8
    },
    {
      "fetchedAt": "2024-01-26T00:00:00.000Z",
      "platform": "YOUTUBE",
      "views": 5600,
      "likes": 210,
      "comments": 32
    },
    {
      "fetchedAt": "2024-01-26T12:00:00.000Z",
      "platform": "YOUTUBE",
      "views": 12500,
      "likes": 450,
      "comments": 67
    }
  ]
}
```

---

## Recommendations

### Get User Recommendations

Get AI-generated recommendations for the user.

**Endpoint**: `GET /recommendations`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "recommendations": [
    {
      "id": "rec_123",
      "type": "BEST_TIME",
      "status": "ACTIVE",
      "title": "Optimal Posting Times Identified",
      "description": "Based on your past performance, posting at 6PM, 8PM, and 9PM tends to generate 45% higher engagement than other times.",
      "confidence": 85,
      "expectedImprovement": 45.0,
      "dataPoints": {
        "timeAnalysis": {
          "18": { "count": 12, "avgEngagement": 8.5 },
          "20": { "count": 10, "avgEngagement": 7.8 },
          "21": { "count": 8, "avgEngagement": 7.2 }
        },
        "bestHours": ["18", "20", "21"]
      },
      "suggestedAction": {
        "action": "schedule_at_times",
        "times": ["18", "20", "21"],
        "timezone": "UTC"
      },
      "createdAt": "2024-01-20T00:00:00.000Z"
    },
    {
      "id": "rec_124",
      "type": "CONTENT_TYPE",
      "status": "ACTIVE",
      "title": "VIDEO Content Performs Best",
      "description": "Your video content generates 67% more engagement than other content types. Consider creating more video content.",
      "confidence": 92,
      "expectedImprovement": 67.0,
      "dataPoints": {
        "typeAnalysis": {
          "VIDEO": { "count": 25, "avgEngagement": 9.2, "avgViews": 15000 },
          "IMAGE": { "count": 15, "avgEngagement": 5.5, "avgViews": 8000 }
        },
        "bestType": "VIDEO"
      },
      "suggestedAction": {
        "action": "create_more",
        "contentType": "VIDEO"
      },
      "createdAt": "2024-01-20T00:00:00.000Z"
    },
    {
      "id": "rec_125",
      "type": "PLATFORM_FOCUS",
      "status": "ACTIVE",
      "title": "INSTAGRAM Shows Strongest Performance",
      "description": "Your content performs exceptionally well on INSTAGRAM with an average engagement rate of 10.50% and total reach of 125,000. Consider focusing more effort here.",
      "confidence": 88,
      "expectedImprovement": 20.0,
      "dataPoints": {
        "platformAnalysis": {
          "INSTAGRAM": { "count": 20, "avgEngagement": 10.5, "totalReach": 125000 },
          "YOUTUBE": { "count": 18, "avgEngagement": 3.8, "totalReach": 98000 }
        },
        "bestPlatform": "INSTAGRAM"
      },
      "suggestedAction": {
        "action": "increase_frequency",
        "platform": "INSTAGRAM"
      },
      "createdAt": "2024-01-20T00:00:00.000Z"
    },
    {
      "id": "rec_126",
      "type": "POSTING_FREQUENCY",
      "status": "ACTIVE",
      "title": "Posting Frequency Analysis",
      "description": "You're currently posting 4.2 times per week. Consider posting daily for maximum engagement and growth.",
      "confidence": 76,
      "expectedImprovement": 15.0,
      "dataPoints": {
        "currentFrequency": 0.6,
        "totalPosts": 45,
        "daysSinceFirst": 75
      },
      "suggestedAction": {
        "action": "adjust_frequency",
        "targetFrequency": 7
      },
      "createdAt": "2024-01-20T00:00:00.000Z"
    }
  ]
}
```

### Generate Recommendations

Manually trigger recommendation generation.

**Endpoint**: `POST /recommendations/generate`

**Headers**: `Authorization: Bearer <token>`

**Response**: `201 Created`
```json
{
  "generated": 4,
  "recommendations": [
    {
      "id": "rec_127",
      "type": "BEST_TIME",
      "title": "Optimal Posting Times Identified"
    }
  ]
}
```

### Apply Recommendation

Mark a recommendation as applied.

**Endpoint**: `POST /recommendations/:recommendationId/apply`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "rec_123",
  "status": "APPLIED",
  "appliedAt": "2024-01-21T12:00:00.000Z"
}
```

### Dismiss Recommendation

Mark a recommendation as dismissed.

**Endpoint**: `POST /recommendations/:recommendationId/dismiss`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "id": "rec_123",
  "status": "DISMISSED",
  "dismissedAt": "2024-01-21T12:00:00.000Z"
}
```

---

## Posting Rules

### List Posting Rules

Get all automated posting rules.

**Endpoint**: `GET /rules`

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "rules": [
    {
      "id": "rule_123",
      "name": "Weekly YouTube Upload",
      "description": "Automatically post new videos to YouTube every Sunday at 6PM",
      "isActive": true,
      "triggers": {
        "type": "schedule",
        "schedule": "0 18 * * 0",
        "timezone": "America/New_York"
      },
      "conditions": {
        "contentType": "VIDEO",
        "minDuration": 60,
        "tags": ["youtube"]
      },
      "actions": {
        "platforms": ["YOUTUBE"],
        "caption": "New video is live! Check it out 🎸",
        "autoSchedule": true
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Create Posting Rule

Create a new automated posting rule.

**Endpoint**: `POST /rules`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "Instagram Daily Stories",
  "description": "Post to Instagram Stories daily at 10AM",
  "isActive": true,
  "triggers": {
    "type": "schedule",
    "schedule": "0 10 * * *",
    "timezone": "America/New_York"
  },
  "conditions": {
    "contentType": "IMAGE",
    "tags": ["story"]
  },
  "actions": {
    "platforms": ["INSTAGRAM"],
    "postType": "STORY",
    "autoSchedule": true
  }
}
```

**Response**: `201 Created`
```json
{
  "id": "rule_124",
  "name": "Instagram Daily Stories",
  "isActive": true,
  "createdAt": "2024-01-21T13:00:00.000Z"
}
```

### Update Posting Rule

Modify an existing posting rule.

**Endpoint**: `PATCH /rules/:ruleId`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "isActive": false,
  "triggers": {
    "schedule": "0 12 * * *"
  }
}
```

**Response**: `200 OK`

### Delete Posting Rule

Remove a posting rule.

**Endpoint**: `DELETE /rules/:ruleId`

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Conflict",
  "error": "Email already exists"
}
```

### 422 Unprocessable Entity
```json
{
  "statusCode": 422,
  "message": "Unprocessable Entity",
  "error": "Cannot publish post - content file not found"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded. Try again in 60 seconds."
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal Server Error",
  "error": "An unexpected error occurred"
}
```

---

## Rate Limits

API rate limits:
- **Authenticated requests**: 100 requests per minute per user
- **OAuth endpoints**: 10 requests per minute per IP
- **Publishing endpoints**: 20 requests per minute per user
- **Analytics collection**: 30 requests per minute per user

When rate limited, the response includes:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642857600
Retry-After: 60
```

---

## Webhooks (Future)

Future webhook support for:
- Post published successfully
- Post publishing failed
- New analytics data available
- New recommendation generated
- Drive folder synced

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Authorization': `Bearer ${yourToken}`
  }
});

// Create a post
const createPost = async () => {
  const response = await api.post('/posts', {
    contentId: 'content_123',
    caption: 'Check out our new video!',
    scheduledFor: '2024-01-25T18:00:00.000Z',
    socialAccountIds: ['acc_youtube_123', 'acc_instagram_456']
  });
  return response.data;
};

// Get recommendations
const getRecommendations = async () => {
  const response = await api.get('/recommendations');
  return response.data.recommendations;
};
```

### Python

```python
import requests

BASE_URL = 'http://localhost:3001/api/v1'
headers = {'Authorization': f'Bearer {your_token}'}

# Create a post
def create_post():
    response = requests.post(
        f'{BASE_URL}/posts',
        headers=headers,
        json={
            'contentId': 'content_123',
            'caption': 'Check out our new video!',
            'scheduledFor': '2024-01-25T18:00:00.000Z',
            'socialAccountIds': ['acc_youtube_123', 'acc_instagram_456']
        }
    )
    return response.json()

# Get analytics
def get_analytics(post_id):
    response = requests.get(
        f'{BASE_URL}/analytics/posts/{post_id}',
        headers=headers
    )
    return response.json()
```

---

## Support

For API support:
- GitHub Issues: [repository]/issues
- Documentation: [docs-url]
- Email: support@example.com

---

## Changelog

### v1.0.0 (2024-01-21)
- Initial API release
- Multi-platform publishing support
- Analytics collection
- AI recommendations
- Google Drive integration
