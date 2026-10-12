# Building HomeShelf for Android

## Current status

The Android project is not yet buildable. It contains Gradle configuration and a manifest, but does not include the Gradle wrapper scripts/JAR or the app source/resources referenced by the manifest. The Android release workflow checks for the wrapper and stops rather than publishing an APK that was not built.

The Android implementation and a successful local/CI build remain pending. This status applies to Android only; it does not affect the web PWA.

## Intended automated build

Once the Android project is complete and the Gradle wrapper is committed:

- Pushing a `v*` tag builds the `release` APK and attaches `homeshelf-android.apk` to that GitHub Release.
- Manually running `android-release.yml` builds the APK and uploads it as a GitHub Actions artifact.
- The current Gradle configuration signs the release variant with the debug signing key. The APK is for testing/sideloading, not Play Store distribution.

## Local build prerequisites

- Android Studio and Android SDK Platform 35
- JDK 17
- A complete Android app module, including the wrapper and all source/resources referenced by `AndroidManifest.xml`

When these prerequisites are in place, open `android/` in Android Studio and build the debug variant, or run:

```bash
cd android
./gradlew assembleDebug
```

The debug APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Web PWA

The web application uses pnpm:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```
