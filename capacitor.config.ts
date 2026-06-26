import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'xyz.shelfscan.app',
  appName: 'Shelf Scan',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    // CRITICAL: Allow WebView to make network requests
    allowNavigation: ['*'],
    iosScheme: 'capacitor'
  },
  plugins: {
    App: {
      scheme: 'shelfscan'
    },
    Keyboard: {
      // 'none' prevents iOS from resizing/scrolling the WebView when
      // the keyboard opens. Our modals handle their own layout instead.
      resize: 'none',
      // Prevent the WebView from scrolling to the focused input
      // (we handle scroll behavior in our own modal components)
      scrollAssist: false,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e3d34",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#FFFFFF"
    },
  },
  ios: {
    contentInset: 'always',
    // CRITICAL: Allow WebView content to load
    allowsInlineMediaPlayback: true,
    scrollEnabled: true,
  },
};
export default config;