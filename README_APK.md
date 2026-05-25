# Zynex APK

Zynex now builds as a real Android TV launcher APK using the local Android SDK.

## Build

```bash
npm install
npm run build:apk
```

The signed debug APK is generated at:

```text
build/outputs/zynex-debug.apk
```

## Install

```bash
adb install -r build/outputs/zynex-debug.apk
```

On Android TV, press Home and choose Zynex as the default launcher when Android asks.

## Native Actions

The APK exposes `window.Android` to the React app. It can:

- list installed TV apps and mobile launcher apps
- launch installed apps
- open Wi-Fi, Bluetooth, Display and app settings
- open Play Store pages for store items
- open Android's file picker
- share app/content text
- open app details and uninstall flows

Gemini search still needs `GEMINI_API_KEY` for web builds. For production APK distribution, this should move behind a backend so the key is not embedded in the client bundle.
