# Group Tour Agent

A comprehensive React Native mobile application for travel agencies to manage group tours, bookings, customer interactions, and payments.

## Overview

Group Tour Agent is a full-featured mobile application designed for travel agencies to streamline their operations. The app enables agencies to create and manage tour packages, handle bookings, communicate with customers through chat and video calls, process payments, and manage team members.

## Features

### Authentication & User Management
- User authentication with OTP verification
- Role-based access control (Agency, Customer, etc.)
- Profile management
- Password reset functionality
- Onboarding flow

### Tour Package Management
- Create and edit tour packages
- Package details and pricing
- Package search and filtering
- Top locations and destination details

### Booking System
- Create new bookings
- Booking summary and details
- Upcoming and completed bookings
- Booking cancellation and refunds
- Cancellation and refund policies

### Communication
- Real-time chat with customers
- Video/voice calls via Agora integration
- Push notifications
- Customer support

### Payment Integration
- Razorpay payment gateway integration
- Payment success/failure handling
- Transaction history
- Bank account linking and KYC

### Additional Features
- Team management
- Quote requests and management
- Travel agency details
- Privacy policy and terms of use
- Document picker and file viewer
- Calendar integration
- Location services
- Social media integration (Facebook SDK)

## Tech Stack

- **Framework**: React Native 0.80.1
- **Language**: JavaScript/TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation (Stack, Tabs, Drawer)
- **Backend Services**:
  - Firebase (Firestore, Analytics, Messaging, Storage, Database)
  - REST API integration
- **Payment**: Razorpay
- **Video/Audio**: Agora RN UIKit
- **UI Components**: React Native Vector Icons, Material Design components

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** or **yarn**
- **React Native CLI**
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)
- **CocoaPods** (for iOS dependencies)
- **Java Development Kit (JDK)** 11 or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GroupTourAgent
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Apply patches**
   The project uses `patch-package` to apply custom patches. Patches are automatically applied during `postinstall`, but you can manually run:
   ```bash
   npx patch-package
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
BASE_URL=your_base_url
API_URL=your_api_url
```

### Firebase Configuration

1. **Android**: Place your `google-services.json` file in `android/app/`
2. **iOS**: Place your `GoogleService-Info.plist` file in `ios/`

### Android Setup

1. Ensure you have the correct `google-services.json` in `android/app/`
2. Configure your `android/app/build.gradle` with the correct package name
3. Set up signing keys for release builds (see `android/app/grouptouragent.keystore`)

### iOS Setup

1. Ensure you have the correct `GoogleService-Info.plist` in `ios/`
2. Configure your bundle identifier in Xcode
3. Set up signing certificates and provisioning profiles

## Running the App

### Start Metro Bundler

```bash
npm start
# or
yarn start
```

### Run on Android

```bash
npm run android
# or
yarn android
```

### Run on iOS

```bash
npm run ios
# or
yarn ios
```

### Clean Build (Android)

```bash
npm run clean
```

## Project Structure

```
GroupTourAgent/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/
│   ├── assets/             # Images, fonts, and other assets
│   ├── components/          # Reusable React components
│   ├── context/             # React Context providers (AuthContext)
│   ├── model/               # Data models
│   ├── navigation/          # Navigation configuration
│   ├── screens/             # Screen components
│   │   ├── AuthScreen/     # Authentication screens
│   │   └── NoAuthScreen/   # Main app screens
│   ├── store/               # Redux store configuration
│   └── utils/               # Utility functions
├── patches/                 # Package patches
├── App.tsx                  # Main app entry point
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Key Dependencies

### Core
- `react-native`: 0.80.1
- `react`: 19.1.0
- `@react-navigation/native`: ^7.1.14
- `@reduxjs/toolkit`: ^2.8.2

### Firebase
- `@react-native-firebase/app`: ^22.4.0
- `@react-native-firebase/firestore`: ^22.4.0
- `@react-native-firebase/messaging`: ^22.4.0
- `@react-native-firebase/storage`: ^22.4.0
- `@react-native-firebase/analytics`: ^22.4.0

### UI & UX
- `react-native-vector-icons`: ^10.2.0
- `react-native-modal`: ^14.0.0-rc.1
- `react-native-calendars`: ^1.1313.0
- `react-native-gifted-chat`: ^2.8.1

### Features
- `react-native-razorpay`: ^2.3.0 (Payments)
- `agora-rn-uikit`: ^5.0.2 (Video/Audio calls)
- `react-native-geolocation-service`: ^5.3.1 (Location)
- `@notifee/react-native`: ^9.1.8 (Notifications)

## Testing

Run tests with:

```bash
npm test
# or
yarn test
```

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues**
   ```bash
   npm start -- --reset-cache
   ```

2. **iOS build issues**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

3. **Android build issues**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. **Node modules issues**
   ```bash
   rm -rf node_modules
   npm install
   ```

### Patch Notes

The project includes patches for:
- `react-native-document-picker`
- `react-native-google-places-autocomplete`
- `react-native-snap-carousel`
- `react-native-splash-screen`

These patches are automatically applied during installation.

## Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run clean` - Clean Android build
- `npm run postinstall` - Apply patches

## Security Notes

- Never commit `.env` files with sensitive data
- Keep `google-services.json` and `GoogleService-Info.plist` secure
- Use proper signing keys for production builds
- Store API keys securely

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]

## Support

For support and questions, please contact [your contact information].

## Version

Current version: **1.0.11**

---

**Note**: This project requires Node.js >= 18. Make sure you have the correct Node version installed before running the application.
