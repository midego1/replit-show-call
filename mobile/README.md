# Show Caller Mobile App

A cross-platform mobile application for Android and iOS developed using React Native and Expo. The app helps performers and production teams manage show calls and notifications for live performances.

## Features

- **User Authentication**: Secure login and registration
- **Show Management**: Create, view, edit, and delete shows
- **Call Management**: Create and manage calls with automatic countdown timers
- **Notifications**: Receive push notifications for upcoming calls
- **Offline Support**: View show information even when offline
- **Cross-Platform**: Works on both iOS and Android devices

## Technical Stack

- **Framework**: React Native with Expo
- **State Management**: React Context API with custom hooks
- **UI Components**: React Native Paper
- **Navigation**: React Navigation (Stack and Tab navigators)
- **Network**: Axios for API requests
- **Storage**: AsyncStorage for local data persistence
- **Notifications**: Expo Notifications

## Development Setup

### Prerequisites

- Node.js 14+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd mobile
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Use the Expo Go app on your device to scan the QR code, or press 'a' to open in an Android emulator or 'i' for iOS simulator.

## Project Structure

```
mobile/
├── assets/              # App assets (images, fonts, etc.)
├── src/
│   ├── api/             # API services
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Application screens
│   └── utils/           # Utility functions
├── App.tsx              # Main application entry point
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## Building and Deployment

To build the app for production:

1. For Android:
   ```
   expo build:android
   ```

2. For iOS:
   ```
   expo build:ios
   ```

## Integration with Web App

The mobile app integrates with the Show Caller web application's API for data synchronization. The app uses the same authentication system and data models as the web app to ensure consistent experience across platforms.

## Related Projects

- [Show Caller Web App](../README.md): The web version of the application.