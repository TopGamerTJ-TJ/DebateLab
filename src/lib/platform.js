// Platform / environment detection helpers used by install-prompt and
// onboarding components. All checks are defensive and SSR-safe.

export function isBrowser() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

// Running inside the app's native iOS wrapper (WKWebView / Capacitor / a
// custom UA marker). We look for common native-wrapper signals rather than
// any one app-specific token so this stays generic.
export function isNativeApp() {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent || "";
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.ReactNativeWebView) return true;
  // Generic marker a native wrapper can inject into the UA.
  if (/nativeapp|base44native|debatelabapp/i.test(ua)) return true;
  return false;
}

// Installed & launched from the Home Screen (PWA standalone mode).
export function isStandalonePWA() {
  if (!isBrowser()) return false;
  const displayStandalone =
    window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = window.navigator.standalone === true;
  return Boolean(displayStandalone || iosStandalone);
}

export function isIOS() {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent || "";
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as Mac but is touch-capable.
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

export function isMobileBrowser() {
  if (!isBrowser()) return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}

export function isDesktop() {
  return isBrowser() && !isMobileBrowser();
}

// True only for actual Safari (not Chrome/Firefox/Edge on iOS, which are
// WebKit-wrapped but identify differently).
export function isSafari() {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent || "";
  const isWebKit = /AppleWebKit/.test(ua);
  const notOtherBrowser = !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Chromium|Android/.test(ua);
  return isWebKit && /Safari/.test(ua) && notOtherBrowser;
}

// Whether the App Store install onboarding step should ever be shown.
// Only real web visitors (browser, not native, not installed) qualify.
export function shouldShowAppStorePromo() {
  if (!isBrowser()) return { show: false, reason: "not_browser" };
  if (isNativeApp()) return { show: false, reason: "native_app" };
  if (isStandalonePWA()) return { show: false, reason: "existing_install" };
  return { show: true, reason: "web" };
}