package com.zynex.launcher;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String TAG = "Zynex";
    private WebView webView;
    private static String cachedAppsJson = null;

    private final android.content.BroadcastReceiver packageReceiver = new android.content.BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.i(TAG, "Package broadcast received: " + intent.getAction());
            cachedAppsJson = null;
            if (webView != null) {
                webView.post(new Runnable() {
                    @Override
                    public void run() {
                        webView.evaluateJavascript("if (window.reloadInstalledApps) window.reloadInstalledApps();", null);
                    }
                });
            }
        }
    };

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);

        webView = new WebView(this);
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.requestFocus();
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);

        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        WebView.setWebContentsDebuggingEnabled(true);
        webView.setWebViewClient(new ZynexWebViewClient());
        webView.setWebChromeClient(new ZynexWebChromeClient());
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");
        webView.loadUrl("file:///android_asset/index.html");

        android.content.IntentFilter filter = new android.content.IntentFilter();
        filter.addAction(Intent.ACTION_PACKAGE_ADDED);
        filter.addAction(Intent.ACTION_PACKAGE_REMOVED);
        filter.addAction(Intent.ACTION_PACKAGE_CHANGED);
        filter.addDataScheme("package");
        registerReceiver(packageReceiver, filter);

        hideSystemUi();
    }

    @Override
    protected void onResume() {
        super.onResume();
        hideSystemUi();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            unregisterReceiver(packageReceiver);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        }
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (webView != null) {
            webView.requestFocus();
        }
        return super.dispatchKeyEvent(event);
    }

    private void hideSystemUi() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
        );
    }

    private static class ZynexWebChromeClient extends WebChromeClient {
        @Override
        public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
            Log.d(TAG, "console/" + consoleMessage.messageLevel() + ": " + consoleMessage.message()
                    + " (" + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + ")");
            return true;
        }
    }

    private static class ZynexWebViewClient extends WebViewClient {
        @Override
        public void onPageFinished(WebView view, String url) {
            Log.i(TAG, "WebView loaded: " + url);
            super.onPageFinished(view, url);
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            Log.e(TAG, "WebView resource error: " + request.getUrl() + " code=" + error.getErrorCode()
                    + " description=" + error.getDescription());
            super.onReceivedError(view, request, error);
        }
    }

    public static class WebAppInterface {
        private final Context context;

        WebAppInterface(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void log(String level, String message) {
            if ("error".equals(level)) {
                Log.e(TAG, message);
            } else if ("warn".equals(level)) {
                Log.w(TAG, message);
            } else {
                Log.i(TAG, message);
            }
        }

        @JavascriptInterface
        public String getDeviceInfo() {
            try {
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("manufacturer", Build.MANUFACTURER);
                jsonObject.put("model", Build.MODEL);
                jsonObject.put("androidVersion", Build.VERSION.RELEASE);
                jsonObject.put("sdk", Build.VERSION.SDK_INT);

                PackageInfo webViewPackage = WebView.getCurrentWebViewPackage();
                jsonObject.put("webView", webViewPackage != null ? webViewPackage.versionName : "Android WebView");

                return jsonObject.toString();
            } catch (Exception exception) {
                exception.printStackTrace();
                return "{}";
            }
        }

        @JavascriptInterface
        public String getInstalledApps() {
            if (cachedAppsJson != null) {
                return cachedAppsJson;
            }
            try {
                PackageManager packageManager = context.getPackageManager();
                LinkedHashMap<String, ResolveInfo> resolvedApps = new LinkedHashMap<>();

                for (ResolveInfo app : queryLaunchables(packageManager, Intent.CATEGORY_LEANBACK_LAUNCHER)) {
                    resolvedApps.put(app.activityInfo.packageName, app);
                }
                for (ResolveInfo app : queryLaunchables(packageManager, Intent.CATEGORY_LAUNCHER)) {
                    resolvedApps.put(app.activityInfo.packageName, app);
                }

                JSONArray jsonArray = new JSONArray();
                for (ResolveInfo resolveInfo : resolvedApps.values()) {
                    String packageName = resolveInfo.activityInfo.packageName;
                    if (packageName.equals(context.getPackageName())) {
                        continue;
                    }

                    JSONObject jsonObject = new JSONObject();
                    jsonObject.put("label", resolveInfo.loadLabel(packageManager).toString());
                    jsonObject.put("packageName", packageName);
                    jsonObject.put("icon", "data:image/webp;base64," + drawableToBase64(resolveInfo.loadIcon(packageManager)));
                    jsonArray.put(jsonObject);
                }
                cachedAppsJson = jsonArray.toString();
                return cachedAppsJson;
            } catch (Exception exception) {
                exception.printStackTrace();
                return "[]";
            }
        }

        @JavascriptInterface
        public boolean launchApp(String packageName) {
            PackageManager packageManager = context.getPackageManager();
            Intent intent = packageManager.getLeanbackLaunchIntentForPackage(packageName);
            if (intent == null) {
                intent = packageManager.getLaunchIntentForPackage(packageName);
            }
            return startIntent(intent);
        }

        @JavascriptInterface
        public boolean openSystemSettings(String panel) {
            String action;
            if ("wifi".equals(panel)) {
                action = Settings.ACTION_WIFI_SETTINGS;
            } else if ("bluetooth".equals(panel)) {
                action = Settings.ACTION_BLUETOOTH_SETTINGS;
            } else if ("display".equals(panel)) {
                action = Settings.ACTION_DISPLAY_SETTINGS;
            } else if ("account".equals(panel)) {
                action = Settings.ACTION_SYNC_SETTINGS;
            } else if ("applications".equals(panel)) {
                action = Settings.ACTION_APPLICATION_SETTINGS;
            } else {
                action = Settings.ACTION_SETTINGS;
            }
            return startIntent(new Intent(action));
        }

        @JavascriptInterface
        public boolean openAppStore(String packageName) {
            String url = packageName.startsWith("search:")
                ? "market://search?q=" + Uri.encode(packageName.substring(7))
                : "market://details?id=" + packageName;
            Intent marketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            marketIntent.setPackage("com.android.vending");
            if (startIntent(marketIntent)) {
                return true;
            }
            String webUrl = packageName.startsWith("search:")
                ? "https://play.google.com/store/search?q=" + Uri.encode(packageName.substring(7))
                : "https://play.google.com/store/apps/details?id=" + packageName;
            return startIntent(new Intent(Intent.ACTION_VIEW, Uri.parse(webUrl)));
        }

        @JavascriptInterface
        public boolean openAppInfo(String packageName) {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + packageName));
            return startIntent(intent);
        }

        @JavascriptInterface
        public boolean uninstallApp(String packageName) {
            Intent intent = new Intent(Intent.ACTION_DELETE);
            intent.setData(Uri.parse("package:" + packageName));
            return startIntent(intent);
        }

        @JavascriptInterface
        public boolean openFileManager() {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("*/*");
            if (startIntent(intent)) {
                return true;
            }
            return openSystemSettings("storage");
        }

        @JavascriptInterface
        public boolean shareText(String title, String text) {
            Intent sendIntent = new Intent(Intent.ACTION_SEND);
            sendIntent.setType("text/plain");
            sendIntent.putExtra(Intent.EXTRA_TITLE, title);
            sendIntent.putExtra(Intent.EXTRA_TEXT, text);
            return startIntent(Intent.createChooser(sendIntent, title));
        }

        private boolean startIntent(Intent intent) {
            if (intent == null) {
                return false;
            }
            try {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
                return true;
            } catch (Exception exception) {
                exception.printStackTrace();
                return false;
            }
        }

        private static List<ResolveInfo> queryLaunchables(PackageManager packageManager, String category) {
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.addCategory(category);
            return new ArrayList<>(packageManager.queryIntentActivities(intent, 0));
        }

        private static String drawableToBase64(Drawable drawable) {
            Bitmap bitmap;
            if (drawable instanceof BitmapDrawable) {
                bitmap = ((BitmapDrawable) drawable).getBitmap();
            } else {
                int width = drawable.getIntrinsicWidth() > 0 ? drawable.getIntrinsicWidth() : 96;
                int height = drawable.getIntrinsicHeight() > 0 ? drawable.getIntrinsicHeight() : 96;
                bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
                Canvas canvas = new Canvas(bitmap);
                drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                drawable.draw(canvas);
            }

            int maxSize = 72;
            int width = bitmap.getWidth();
            int height = bitmap.getHeight();
            if (width > maxSize || height > maxSize) {
                float scale = Math.min((float) maxSize / width, (float) maxSize / height);
                int scaledWidth = Math.max(1, Math.round(width * scale));
                int scaledHeight = Math.max(1, Math.round(height * scale));
                bitmap = Bitmap.createScaledBitmap(bitmap, scaledWidth, scaledHeight, true);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                bitmap.compress(Bitmap.CompressFormat.WEBP_LOSSY, 75, outputStream);
            } else {
                bitmap.compress(Bitmap.CompressFormat.WEBP, 75, outputStream);
            }
            return Base64.encodeToString(outputStream.toByteArray(), Base64.NO_WRAP);
        }
    }
}
