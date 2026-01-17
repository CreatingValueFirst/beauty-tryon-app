# BeautyTryOn Mobile App (Flutter)

Flutter mobile application for iOS and Android with AR virtual try-on capabilities.

## 🚀 Features

- **Hair Virtual Try-On**: Real-time AR hair color and style try-on using device camera
- **Nail Design Try-On**: Hand tracking AR for nail polish visualization
- **Gallery**: Save and organize favorite looks
- **Social Sharing**: Share results to social media platforms
- **Cross-Platform**: Single codebase for iOS and Android

## 📋 Prerequisites

- Flutter SDK ≥3.0.0
- Dart SDK
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

## 🔧 Setup

### 1. Install Flutter

```bash
# macOS
brew install flutter

# Or download from https://flutter.dev/docs/get-started/install
```

### 2. Install Dependencies

```bash
cd apps/mobile
flutter pub get
```

### 3. Configure Environment

Create a `.env` file or use `--dart-define` for environment variables:

```bash
flutter run \
  --dart-define=SUPABASE_URL=your-supabase-url \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the App

```bash
# Development mode
flutter run

# iOS
flutter run -d ios

# Android
flutter run -d android

# Specific device
flutter devices
flutter run -d <device-id>
```

## 🏗️ Project Structure

```
lib/
├── main.dart                 # App entry point
├── config/
│   └── app_config.dart       # Environment configuration
├── theme/
│   └── app_theme.dart        # App theming (purple/pink gradient)
├── router/
│   └── app_router.dart       # GoRouter navigation
├── screens/
│   ├── splash_screen.dart
│   ├── onboarding/
│   ├── auth/
│   ├── home/
│   ├── hair/
│   ├── nails/
│   ├── gallery/
│   └── profile/
├── widgets/                  # Reusable widgets
├── providers/                # Riverpod state management
├── services/                 # API services
└── models/                   # Data models
```

## 📱 Screens

### Splash Screen
- App logo animation
- Routing logic (onboarding vs. home)

### Onboarding
- 3-page swipeable introduction
- Feature highlights
- Skip/Next/Get Started buttons

### Authentication
- Login screen
- Signup screen
- Supabase authentication integration

### Home Dashboard
- Quick action cards (Hair/Nails)
- Recent try-ons carousel
- Trending styles grid
- Bottom navigation

### Try-On Screens
- Camera AR interface
- Style selection carousel
- Real-time preview
- Save/Share actions

### Gallery
- Grid view of saved looks
- Filter by type (hair/nails)
- Delete/Share options

### Profile
- User information
- Subscription tier
- Settings
- Sign out

## 🎨 Theming

The app uses a consistent brand theme matching the web app:
- Primary: Purple (#8B5CF6)
- Secondary: Pink (#EC4899)
- Font: Google Fonts Inter

Custom widgets:
- `GradientText`: Text with gradient shader

## 🔌 Integrations

### Supabase
```dart
import 'package:supabase_flutter/supabase_flutter.dart';

await Supabase.initialize(
  url: AppConfig.supabaseUrl,
  anonKey: AppConfig.supabaseAnonKey,
);

final supabase = Supabase.instance.client;
```

### Camera & AR
```dart
import 'package:camera/camera.dart';

final cameras = await availableCameras();
final controller = CameraController(
  cameras.first,
  ResolutionPreset.high,
);
```

## 🧪 Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Integration tests
flutter drive --target=test_driver/app.dart
```

## 📦 Build & Release

### Android

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# App Bundle (for Play Store)
flutter build appbundle --release
```

### iOS

```bash
# Debug
flutter build ios --debug

# Release
flutter build ios --release

# Archive (for App Store)
flutter build ipa
```

## 🔐 Permissions

### iOS (ios/Runner/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for virtual try-on</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo access to save your looks</string>
```

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 🚢 Deployment

### iOS App Store
1. Configure signing in Xcode
2. Build archive: `flutter build ipa`
3. Upload via Xcode or Transporter
4. Submit for review in App Store Connect

### Google Play Store
1. Generate signing key
2. Build bundle: `flutter build appbundle --release`
3. Upload to Google Play Console
4. Complete store listing and submit

## 🐛 Troubleshooting

**Camera permission denied:**
- Check Info.plist (iOS) or AndroidManifest.xml (Android)
- Request permissions at runtime using `permission_handler`

**Build fails:**
```bash
flutter clean
flutter pub get
flutter pub upgrade
```

**Hot reload not working:**
- Restart the app: `r` in terminal
- Full restart: `R` in terminal

## 📚 Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Supabase Flutter Guide](https://supabase.com/docs/guides/with-flutter)
- [Camera Plugin](https://pub.dev/packages/camera)
- [GoRouter](https://pub.dev/packages/go_router)

## 🤝 Contributing

1. Create feature branch
2. Implement changes
3. Run tests: `flutter test`
4. Format code: `flutter format .`
5. Analyze: `flutter analyze`
6. Submit PR

## 📄 License

Proprietary - BeautyTryOn
