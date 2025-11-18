# Unmotivated Hero Mobile App

React Native mobile application for iOS and Android, built with Expo.

## 🎯 Features

- **Cross-Platform**: Single codebase for iOS and Android
- **OAuth Authentication**: Secure login with JWT tokens
- **Social Media Management**: Schedule posts across platforms
- **Content Library**: Manage your media files
- **Analytics Dashboard**: Track performance metrics
- **Push Notifications**: Stay updated on post status
- **Dark Mode**: Automatic theme switching
- **Offline Support**: Secure token storage and graceful offline handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- iOS: Xcode (Mac only)
- Android: Android Studio
- Expo CLI (installed globally)

### Installation

```bash
cd mobile
npm install
```

### Configuration

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your settings:**
   ```env
   API_URL=http://your-api-url.com/api/v1
   ```

3. **For iOS (Mac only):**
   ```bash
   npx pod-install
   ```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser (for testing)
npm run web
```

### Testing on Physical Device

1. Install **Expo Go** app on your device:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan QR code from terminal/Expo Dev Tools

## 📁 Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ScheduleScreen.tsx
│   │   ├── ContentScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── RootNavigator.tsx
│   ├── services/         # API and business logic
│   │   ├── api.ts
│   │   └── auth.ts
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── theme/            # Theme and styling
│       ├── colors.ts
│       └── ThemeProvider.tsx
├── assets/               # Images, fonts, icons
├── App.tsx              # Root component
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🎨 Tech Stack

- **React Native**: Core framework
- **Expo**: Development platform
- **TypeScript**: Type safety
- **React Navigation**: Navigation (Stack & Tab)
- **Zustand**: State management
- **Axios**: HTTP client
- **Expo SecureStore**: Secure token storage
- **Expo Camera**: Media capture
- **Expo Notifications**: Push notifications

## 🔐 Authentication Flow

1. User enters credentials on Login/Register screen
2. API returns JWT access token + refresh token
3. Tokens stored securely in Expo SecureStore
4. Access token added to all API requests via interceptor
5. Refresh token used to obtain new access token on 401
6. Navigation automatically switches between auth and main screens

## 📱 Screens

### Authentication
- **LoginScreen**: Email/password login
- **RegisterScreen**: New account creation

### Main App
- **DashboardScreen**: Overview stats and quick actions
- **ScheduleScreen**: Create and schedule posts
- **ContentScreen**: Media library from Google Drive
- **AnalyticsScreen**: Performance metrics and insights
- **SettingsScreen**: Account, platform connections, app settings

## 🔧 Development

### Adding New Screen

1. Create screen component in `src/screens/`
2. Add to navigation in `src/navigation/RootNavigator.tsx`
3. Define types if needed in `src/types/`

### Adding New API Endpoint

1. Add type definitions to `src/types/index.ts`
2. Create service function using `api` instance from `src/services/api.ts`
3. Use in screen components with proper error handling

### Using Theme

```tsx
import { useTheme } from '../theme/ThemeProvider';

function MyComponent() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

### State Management

Using Zustand for simple, performant state management:

```tsx
import { create } from 'zustand';

interface Store {
  posts: Post[];
  fetchPosts: () => Promise<void>;
}

export const usePostStore = create<Store>((set) => ({
  posts: [],
  fetchPosts: async () => {
    const posts = await api.get<Post[]>('/posts');
    set({ posts });
  },
}));
```

## 📦 Building for Production

### iOS (Requires Mac + Apple Developer Account)

```bash
# Configure app.json with bundle identifier
# Build for App Store
eas build --platform ios

# Or use Xcode for local builds
npm run ios --configuration Release
```

### Android

```bash
# Build for Google Play
eas build --platform android

# Or local APK build
cd android
./gradlew assembleRelease
```

### Using EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for both platforms
eas build --platform all
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🐛 Debugging

### React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Run app in development mode
3. Shake device or press Cmd+D (iOS) / Cmd+M (Android)
4. Select "Debug"

### Expo Dev Tools

```bash
npm start
# Opens browser with Expo DevTools
# View logs, run on devices, clear cache
```

### Common Issues

**Metro bundler issues:**
```bash
npm start --clear
```

**iOS build errors:**
```bash
cd ios
pod install
cd ..
npm run ios
```

**Android build errors:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

## 🔔 Push Notifications

Configured with Expo Notifications. To enable:

1. Request permissions (already in App.tsx)
2. Get push token:
   ```tsx
   const token = await Notifications.getExpoPushTokenAsync();
   ```
3. Send token to backend
4. Backend sends notifications via Expo Push API

## 📸 Camera & Media

Using Expo Camera and Image Picker:

```tsx
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [16, 9],
    quality: 1,
  });

  if (!result.canceled) {
    // Upload result.assets[0].uri
  }
};
```

## 🌐 API Integration

All API calls go through `src/services/api.ts` which handles:
- Authentication headers
- Token refresh on 401
- Error handling
- Request/response interceptors

Example usage:
```tsx
import { api } from '../services/api';

const posts = await api.get<Post[]>('/posts');
const post = await api.post<Post>('/posts', { title: 'New Post' });
```

## 📊 Performance

- Uses React Navigation for optimized navigation
- Lazy loading with React.lazy() where needed
- Image optimization with Expo Image
- Secure storage for tokens (encrypted on device)
- Efficient re-renders with Zustand

## 🚀 Deployment Checklist

- [ ] Update version in `app.json`
- [ ] Set production API URL in `.env`
- [ ] Configure app icons and splash screen
- [ ] Update privacy policy and terms
- [ ] Test on physical devices (iOS + Android)
- [ ] Run production builds
- [ ] Submit to App Store / Play Store

## 📄 License

[Your License Here]

## 🤝 Contributing

This is the mobile companion to the Unmotivated Hero platform. See main repository for backend and web app.

## 📞 Support

For issues and questions, please see the main project repository.

---

**Version**: 1.0.0
**Platform**: iOS 13+, Android 8+
**Built with**: React Native + Expo
