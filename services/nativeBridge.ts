import { LauncherItem, ItemType } from '../types';

// Define the interface that Kotlin/Java will inject into the WebView
declare global {
  interface Window {
    Android?: {
      getInstalledApps: () => string; // Returns JSON string of apps
      launchApp: (packageName: string) => boolean; // Returns success status
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

  /**
   * Attempts to launch an app via Intent.
   */
  launchApp: (packageName: string): boolean => {
    if (!window.Android) {
      console.log(`[DEV MODE] Would launch package: ${packageName}`);
      return true; // Simulate success in dev
    }
    return window.Android.launchApp(packageName);
  }
};