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
WEB_BUNDLE_DIR="$WEB_ASSETS/assets"
BUILD_DIR="$ROOT_DIR/build/android"
RES_ZIP="$BUILD_DIR/compiled-res.zip"
UNSIGNED_APK="$BUILD_DIR/zynex-unsigned.apk"
DEX_APK="$BUILD_DIR/zynex-dex.apk"
ALIGNED_APK="$BUILD_DIR/zynex-aligned.apk"
SIGNED_APK="$ROOT_DIR/build/outputs/zynex-debug.apk"
SHARE_APK="$ROOT_DIR/build/outputs/zynex-tvbox-legacy.apk"
KEYSTORE="$ROOT_DIR/build/debug.keystore"

rm -rf "$WEB_ASSETS" "$BUILD_DIR/classes" "$BUILD_DIR/generated" "$BUILD_DIR/dex" "$BUILD_DIR/compiled" "$ROOT_DIR/build/outputs"
mkdir -p "$WEB_BUNDLE_DIR" "$BUILD_DIR/classes" "$BUILD_DIR/generated" "$BUILD_DIR/dex" "$BUILD_DIR/compiled" "$ROOT_DIR/build/outputs"

API_KEY_JSON="$(node -e 'process.stdout.write(JSON.stringify(process.env.GEMINI_API_KEY || ""))')"

npx tailwindcss -i "$ROOT_DIR/styles.css" -o "$WEB_BUNDLE_DIR/zynex-legacy.css" --minify
npx esbuild "$ROOT_DIR/index.tsx" \
  --bundle \
  --format=iife \
  --global-name=ZynexApp \
  --target=chrome66 \
  --outfile="$WEB_BUNDLE_DIR/zynex-legacy.js" \
  --define:process.env.NODE_ENV='"production"' \
  --define:process.env.API_KEY="$API_KEY_JSON" \
  --define:process.env.GEMINI_API_KEY="$API_KEY_JSON" \
  --loader:.css=empty \
  --minify

cat > "$WEB_ASSETS/index.html" <<'HTML'
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Zynex TV Launcher</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&family=Zen+Dots&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="./assets/zynex-legacy.css" />
    <style>
      body {
        margin: 0;
        overflow: hidden;
        background: #050505;
        font-family: Outfit, sans-serif;
      }

      h1, h2, h3, .font-tech {
        font-family: Rajdhani, sans-serif;
        font-weight: 700;
      }

      .font-brand {
        font-family: "Zen Dots", cursive;
        font-weight: 400;
      }

      #boot-fallback {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e5e7eb;
        background:
          radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.18), transparent 28rem),
          radial-gradient(circle at 80% 75%, rgba(99, 102, 241, 0.16), transparent 30rem),
          #050505;
        z-index: 1;
      }

      #boot-fallback .panel {
        width: min(72vw, 720px);
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(8, 8, 12, 0.72);
        padding: 36px;
        border-radius: 18px;
        text-align: center;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
      }

      #boot-fallback h1 {
        margin: 0 0 12px;
        font-size: 42px;
        letter-spacing: 0.16em;
      }

      #boot-fallback p {
        margin: 0;
        color: #94a3b8;
        line-height: 1.5;
      }
    </style>
    <script>
      (function () {
        if (typeof window.globalThis === "undefined") {
          window.globalThis = window;
        }
        if (!window.queueMicrotask) {
          window.queueMicrotask = function (callback) {
            Promise.resolve().then(callback);
          };
        }
        if (!Object.fromEntries) {
          Object.fromEntries = function (entries) {
            var object = {};
            if (entries && typeof entries[Symbol.iterator] === "function") {
              var iterator = entries[Symbol.iterator]();
              var step = iterator.next();
              while (!step.done) {
                object[step.value[0]] = step.value[1];
                step = iterator.next();
              }
              return object;
            }
            for (var i = 0; entries && i < entries.length; i += 1) {
              object[entries[i][0]] = entries[i][1];
            }
            return object;
          };
        }
        if (!Array.prototype.flat) {
          Array.prototype.flat = function () {
            return Array.prototype.concat.apply([], this);
          };
        }
        if (!Array.prototype.flatMap) {
          Array.prototype.flatMap = function (callback, thisArg) {
            return this.map(callback, thisArg).flat();
          };
        }

        if (window.performance && window.performance.measure) {
          var originalMeasure = window.performance.measure;
          window.performance.measure = function (name, startOrOptions, end) {
            try {
              if (typeof startOrOptions === 'object' && startOrOptions !== null) {
                var start = typeof startOrOptions.start === 'string' ? startOrOptions.start : undefined;
                var endMark = typeof startOrOptions.end === 'string' ? startOrOptions.end : undefined;
                if (start && endMark) {
                  return originalMeasure.call(window.performance, name, start, endMark);
                } else if (start) {
                  return originalMeasure.call(window.performance, name, start);
                } else {
                  return originalMeasure.call(window.performance, name);
                }
              }
              return originalMeasure.apply(window.performance, arguments);
            } catch (e) {
              // Silently ignore to prevent crashes
            }
          };
        }

        function nativeLog(level, message) {
          try {
            if (window.Android && window.Android.log) {
              window.Android.log(level, String(message));
            }
          } catch (error) {}
        }

        window.__ZYNEX_BOOTED__ = false;
        window.addEventListener("error", function (event) {
          nativeLog("error", "JS error: " + event.message + " at " + event.filename + ":" + event.lineno + ":" + event.colno);
        });
        window.addEventListener("unhandledrejection", function (event) {
          nativeLog("error", "Unhandled rejection: " + (event.reason && (event.reason.stack || event.reason.message) || event.reason));
        });
        setTimeout(function () {
          if (!window.__ZYNEX_BOOTED__) {
            nativeLog("error", "React did not report boot after 8 seconds");
            var detail = document.getElementById("boot-detail");
            if (detail) {
              detail.textContent = "El motor grafico no arranco. Revisar adb logcat con filtro Zynex.";
            }
          }
        }, 8000);
      })();
    </script>
  </head>
  <body>
    <div id="boot-fallback">
      <div class="panel">
        <h1 class="font-brand">ZYNEX</h1>
        <p id="boot-detail">Iniciando launcher...</p>
      </div>
    </div>
    <div id="root"></div>
    <script src="./assets/zynex-legacy.js"></script>
  </body>
</html>
HTML

"$BUILD_TOOLS_DIR/aapt2" compile --dir "$ROOT_DIR/app/src/main/res" -o "$RES_ZIP"
"$BUILD_TOOLS_DIR/aapt2" link \
  -I "$PLATFORM_JAR" \
  --manifest "$ROOT_DIR/app/src/main/AndroidManifest.xml" \
  --java "$BUILD_DIR/generated" \
  -A "$WEB_ASSETS" \
  --min-sdk-version 23 \
  --target-sdk-version 36 \
  --version-code 2 \
  --version-name 0.2.0 \
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
cp "$SIGNED_APK" "$SHARE_APK"
echo "$SIGNED_APK"
