# Building & Installing HomeShelf for Android 📱

This guide covers building the native Android APK locally, installing it onto an Android device, and downloading pre-compiled APKs directly from GitHub Releases.

---

## 1. Automated GitHub Releases (Zero Local Setup)

Every commit and pull request merged to the `main` branch automatically triggers the `.github/workflows/release-apk.yml` pipeline:

1. Navigate to the **Releases** tab on your GitHub repository.
2. Download the latest `homeshelf-v1.0.0-debug.apk`.
3. Transfer or open the `.apk` directly on your Android phone.
4. Tap **Install** (pre-signed with Android debug credentials for instant sideloading).

---

## 2. Local Android Studio Build

### Prerequisites
- **Android Studio Ladybug (2024.2+)** or newer
- **JDK 17** (Temurin or OpenJDK recommended)
- **Android SDK API 35** and **Build-Tools 35.0.0**

### Build Steps

1. Clone repository:
   ```bash
   git clone https://github.com/your-username/homeshelf.git
   cd homeshelf/android
   ```
2. Open the `android/` directory in Android Studio.
3. Allow Gradle to sync dependencies (Compose BOM 2024.12, Room 2.6.1, CameraX 1.4.1).
4. Connect an Android device with USB Debugging enabled, or launch an Android Virtual Device (AVD).
5. Click **Run** (`Shift + F10`) or build via terminal:
   ```bash
   ./gradlew assembleDebug
   ```
6. The compiled APK is generated at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 3. Direct ADB Sideloading

To install directly to a connected device via USB:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Web PWA Local Build & Deployment

To run the offline Web PWA version locally:

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production (GitHub Pages bundle)
npm run build
```
