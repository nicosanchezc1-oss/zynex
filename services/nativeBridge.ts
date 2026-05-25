import { LauncherItem, ItemType } from '../types';

// Define the interface that Kotlin/Java will inject into the WebView
declare global {
  interface Window {
    Android?: {
      getInstalledApps: () => string; // Returns JSON string of apps
      getDeviceInfo: () => string;
      launchApp: (packageName: string) => boolean; // Returns success status
      openSystemSettings: (panel: string) => boolean;
      openAppStore: (packageName: string) => boolean;
      openAppInfo: (packageName: string) => boolean;
      uninstallApp: (packageName: string) => boolean;
      openFileManager: () => boolean;
      shareText: (title: string, text: string) => boolean;
    };
  }
}

export const nativeBridge = {
  /**
   * Checks if the app is running inside the Android WebView wrapper.
   */
  isNative: (): boolean => {
    return typeof window.Android !== 'undefined';
  },

  /**
   * Fetches installed apps from the device via PackageManager.
   * Expected JSON format from Kotlin:
   * [ { "label": "Netflix", "packageName": "com.netflix.mediaclient", "icon": "base64String..." }, ... ]
   */
  getInstalledApps: async (): Promise<LauncherItem[]> => {
    if (!window.Android) {
      console.warn("Native bridge not found. Using fallback data.");
      return [];
    }

    try {
      const jsonString = window.Android.getInstalledApps();
      const nativeApps = JSON.parse(jsonString);

      return nativeApps.map((app: any, index: number) => ({
        id: app.packageName,
        title: app.label,
        description: 'Aplicación instalada',
        type: ItemType.APP,
        packageName: app.packageName,
        // Assuming Kotlin sends the icon as a Base64 string prefixed properly, or just the raw base64
        imageUrl: app.icon.startsWith('data:image') ? app.icon : `data:image/png;base64,${app.icon}`,
        color: 'from-gray-800 to-gray-900' // Default fallback color
      }));
    } catch (error) {
      console.error("Error parsing native apps:", error);
      return [];
    }
  },

  getDeviceInfo: async (): Promise<{
    manufacturer: string;
    model: string;
    androidVersion: string;
    sdk: number;
    webView: string;
  }> => {
    if (!window.Android) {
      return {
        manufacturer: 'Preview',
        model: 'Browser',
        androidVersion: 'Web',
        sdk: 0,
        webView: navigator.userAgent,
      };
    }

    try {
      return JSON.parse(window.Android.getDeviceInfo());
    } catch (error) {
      console.error("Error parsing device info:", error);
      return {
        manufacturer: 'Android',
        model: 'TV Box',
        androidVersion: 'Unknown',
        sdk: 0,
        webView: 'Android WebView',
      };
    }
  },

  /**
   * Attempts to launch an app via Intent.
   */
  launchApp: (packageName: string): boolean => {
    if (!window.Android) {
      console.log(`[DEV MODE] Would launch package: ${packageName}`);
      return true; // Simulate success in dev
    }
    return window.Android.launchApp(packageName);
  },

  openSystemSettings: (panel = 'settings'): boolean => {
    if (!window.Android) {
      console.log(`[DEV MODE] Would open settings panel: ${panel}`);
      return true;
    }
    return window.Android.openSystemSettings(panel);
  },

  openAppStore: (packageName: string): boolean => {
    if (!window.Android) {
      window.open(`https://play.google.com/store/apps/details?id=${packageName}`, '_blank');
      return true;
    }
    return window.Android.openAppStore(packageName);
  },

  openAppInfo: (packageName: string): boolean => {
    if (!window.Android) {
      console.log(`[DEV MODE] Would open app info: ${packageName}`);
      return true;
    }
    return window.Android.openAppInfo(packageName);
  },

  uninstallApp: (packageName: string): boolean => {
    if (!window.Android) {
      console.log(`[DEV MODE] Would uninstall: ${packageName}`);
      return true;
    }
    return window.Android.uninstallApp(packageName);
  },

  openFileManager: (): boolean => {
    if (!window.Android) {
      console.log('[DEV MODE] Would open Android file manager');
      return true;
    }
    return window.Android.openFileManager();
  },

  shareText: (title: string, text: string): boolean => {
    if (!window.Android) {
      if (navigator.share) {
        navigator.share({ title, text }).catch(() => undefined);
        return true;
      }
      console.log(`[DEV MODE] Would share: ${title} ${text}`);
      return true;
    }
    return window.Android.shareText(title, text);
  }
};
