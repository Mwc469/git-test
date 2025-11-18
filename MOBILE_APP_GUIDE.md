# Mobile App Implementation Guide

## Overview

The Unmotivated Hero mobile app is a React Native application built with Expo that provides native iOS and Android experiences for managing social media automation.

## Architecture

### Technology Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tooling
- **TypeScript**: Type-safe development
- **React Navigation**: Native navigation (Stack + Tabs)
- **Zustand**: Lightweight state management
- **Axios**: HTTP client with interceptors
- **Expo SecureStore**: Encrypted token storage

### Key Features

1. **Authentication**
   - JWT-based auth with secure storage
   - Auto token refresh
   - Seamless auth state management

2. **Screens**
   - Login/Register (auth flow)
   - Dashboard (stats overview)
   - Schedule (post creation)
   - Content (media library)
   - Analytics (performance tracking)
   - Settings (account & platforms)

3. **Native Capabilities**
   - Camera access for content capture
   - Push notifications for updates
   - Secure credential storage
   - Offline data persistence

4. **UI/UX**
   - Dark/light mode support
   - Native navigation patterns
   - Platform-specific styling
   - Responsive layouts

## Development Workflow

### Initial Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on iOS (Mac only)
npm run ios

# Run on Android
npm run android
```

### Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable UI components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API & business logic
│   ├── hooks/            # Custom hooks
│   ├── theme/            # Theming & styles
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── assets/               # Static assets
├── App.tsx              # Root component
└── app.json             # Expo config
```

### API Integration

The mobile app connects to the same backend API as the web app:

```typescript
// API service with auto token refresh
import { api } from './services/api';

// Get data
const posts = await api.get<Post[]>('/posts');

// Create data
const post = await api.post<Post>('/posts', { title: 'New Post' });

// Upload files
await api.uploadFile('/content/upload', fileUri, (progress) => {
  console.log(`Upload: ${progress}%`);
});
```

### State Management

Using Zustand for simple, performant state:

```typescript
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    set({ user: response.user });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    set({ user: null });
  },
}));
```

### Navigation

React Navigation v6 with TypeScript:

```typescript
// Auth stack when not logged in
<Stack.Navigator>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="Register" component={RegisterScreen} />
</Stack.Navigator>

// Main tabs when authenticated
<Tab.Navigator>
  <Tab.Screen name="Dashboard" component={DashboardScreen} />
  <Tab.Screen name="Schedule" component={ScheduleScreen} />
  <Tab.Screen name="Content" component={ContentScreen} />
  <Tab.Screen name="Analytics" component={AnalyticsScreen} />
</Tab.Navigator>
```

## Building for Production

### iOS Build

Requirements:
- Mac with Xcode
- Apple Developer Account ($99/year)
- Certificates and provisioning profiles

```bash
# Using EAS (Recommended)
eas build --platform ios

# Or local build with Xcode
npm run ios --configuration Release
```

### Android Build

```bash
# Using EAS (Recommended)
eas build --platform android

# Or local APK
cd android
./gradlew assembleRelease
```

### Expo Application Services (EAS)

The easiest way to build and deploy:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure builds
eas build:configure

# Build for both platforms
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Testing

### On Simulators/Emulators

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android
```

### On Physical Devices

1. Install **Expo Go** app
2. Scan QR code from terminal
3. App runs instantly on device

### Production Testing

Test production builds before submission:

```bash
# iOS TestFlight
eas build --platform ios --profile preview

# Android internal testing
eas build --platform android --profile preview
```

## Deployment

### App Store (iOS)

1. **Prepare:**
   - Update version in `app.json`
   - Create screenshots (6.5", 5.5")
   - Write app description
   - Set privacy policy URL

2. **Build:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit:**
   ```bash
   eas submit --platform ios
   ```

4. **Review:**
   - Typically 1-3 days
   - Respond to any feedback

### Google Play (Android)

1. **Prepare:**
   - Update version in `app.json`
   - Create screenshots & feature graphic
   - Complete store listing
   - Set content rating

2. **Build:**
   ```bash
   eas build --platform android --profile production
   ```

3. **Submit:**
   ```bash
   eas submit --platform android
   ```

4. **Review:**
   - Usually a few hours
   - Roll out gradually

## Features to Implement

### Phase 10 Enhancements

1. **Post Creation**
   - Camera integration
   - Media picker
   - Multi-platform targeting
   - Schedule date/time picker

2. **Content Management**
   - Google Drive sync
   - Local media library
   - Upload progress
   - Content preview

3. **Analytics**
   - Performance charts
   - Platform comparison
   - Engagement metrics
   - Export reports

4. **Push Notifications**
   - Post published alerts
   - Scheduling reminders
   - Performance milestones
   - System updates

5. **Offline Support**
   - Draft posts offline
   - Queue for upload
   - Cached content viewing
   - Sync when online

## Best Practices

### Performance

- Use `React.memo()` for expensive components
- Implement FlatList for large lists
- Lazy load screens with `React.lazy()`
- Optimize images with Expo Image
- Profile with React DevTools Profiler

### Security

- Never store sensitive data unencrypted
- Use SecureStore for tokens
- Validate all user inputs
- Use HTTPS for all API calls
- Implement certificate pinning

### UX

- Follow platform guidelines (iOS HIG, Material Design)
- Provide loading states
- Handle errors gracefully
- Support both orientations
- Test on different screen sizes

## Troubleshooting

### Common Issues

**Metro bundler errors:**
```bash
npm start --clear
```

**Native module issues:**
```bash
npx expo install --check
```

**iOS build fails:**
```bash
cd ios && pod install && cd ..
```

**Android build fails:**
```bash
cd android && ./gradlew clean && cd ..
```

### Debugging

1. **React Native Debugger**: Best debugging experience
2. **Expo DevTools**: Built-in tools and logs
3. **Reactotron**: State inspection
4. **Flipper**: Network, layout debugging

## Next Steps

1. **Complete UI Implementation**
   - Finish all screen functionality
   - Add loading and error states
   - Implement form validation

2. **Add Native Features**
   - Camera for content creation
   - Push notifications
   - Biometric authentication
   - Share target integration

3. **Optimize Performance**
   - Image caching
   - Data persistence
   - Background sync
   - Memory optimization

4. **Testing**
   - Unit tests (Jest)
   - Component tests (React Native Testing Library)
   - E2E tests (Detox)
   - Manual QA on devices

5. **Deploy**
   - Beta testing (TestFlight, Internal Testing)
   - Gather feedback
   - Polish and fix bugs
   - Production release

## Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [EAS Build & Submit](https://docs.expo.dev/build/introduction/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://m3.material.io)

---

**Phase 10 Status**: Foundation complete, ready for feature development
**Next**: Implement full post creation and content management
