#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
PLATFORM_JAR="$SDK_DIR/platforms/android-36/android.jar"
BUILD_TOOLS_DIR="$SDK_DIR/build-tools/36.1.0"

if [[ ! -f "$PLATFORM_JAR" ]]; then
  echo "Android SDK platform 36 not found at $PLATFORM_JAR" >&2
  exit 1
fi

if [[ ! -x "$BUILD_TOOLS_DIR/aapt2" ]]; then
  BUILD_TOOLS_DIR="$SDK_DIR/build-tools/36.0.0"
fi

WEB_ASSETS="$ROOT_DIR/app/src/main/assets"
BUILD_DIR="$ROOT_DIR/build/android"
RES_ZIP="$BUILD_DIR/compiled-res.zip"
UNSIGNED_APK="$BUILD_DIR/zynex-unsigned.apk"
DEX_APK="$BUILD_DIR/zynex-dex.apk"
ALIGNED_APK="$BUILD_DIR/zynex-aligned.apk"
SIGNED_APK="$ROOT_DIR/build/outputs/zynex-debug.apk"
KEYSTORE="$ROOT_DIR/build/debug.keystore"

rm -rf "$WEB_ASSETS" "$BUILD_DIR/classes" "$BUILD_DIR/generated" "$BUILD_DIR/dex" "$BUILD_DIR/compiled" "$ROOT_DIR/build/outputs"
mkdir -p "$WEB_ASSETS" "$BUILD_DIR/classes" "$BUILD_DIR/generated" "$BUILD_DIR/dex" "$BUILD_DIR/compiled" "$ROOT_DIR/build/outputs"

npm run build
cp -R "$ROOT_DIR/dist/." "$WEB_ASSETS/"

"$BUILD_TOOLS_DIR/aapt2" compile --dir "$ROOT_DIR/app/src/main/res" -o "$RES_ZIP"
"$BUILD_TOOLS_DIR/aapt2" link \
  -I "$PLATFORM_JAR" \
  --manifest "$ROOT_DIR/app/src/main/AndroidManifest.xml" \
  --java "$BUILD_DIR/generated" \
  -A "$WEB_ASSETS" \
  --min-sdk-version 23 \
  --target-sdk-version 36 \
  --version-code 1 \
  --version-name 0.1.0 \
  -o "$UNSIGNED_APK" \
  "$RES_ZIP"

javac -encoding UTF-8 \
  --release 17 \
  -classpath "$PLATFORM_JAR" \
  -d "$BUILD_DIR/classes" \
  $(find "$BUILD_DIR/generated" "$ROOT_DIR/app/src/main/java" -name '*.java')

"$BUILD_TOOLS_DIR/d8" \
  --lib "$PLATFORM_JAR" \
  --output "$BUILD_DIR/dex" \
  $(find "$BUILD_DIR/classes" -name '*.class')

cp "$UNSIGNED_APK" "$DEX_APK"
(cd "$BUILD_DIR/dex" && zip -qr "$DEX_APK" classes.dex)
"$BUILD_TOOLS_DIR/zipalign" -f 4 "$DEX_APK" "$ALIGNED_APK"

if [[ ! -f "$KEYSTORE" ]]; then
  keytool -genkeypair \
    -keystore "$KEYSTORE" \
    -storepass android \
    -keypass android \
    -alias androiddebugkey \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null
fi

"$BUILD_TOOLS_DIR/apksigner" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$SIGNED_APK" \
  "$ALIGNED_APK"

"$BUILD_TOOLS_DIR/apksigner" verify "$SIGNED_APK"
echo "$SIGNED_APK"
