// Centralized, app-specific configuration.
// Keep all branding, store URLs, and asset references here so generic
// components (onboarding, install prompts, etc.) work across any project
// without hardcoding values inside the components themselves.
//
// Values can be overridden per-deployment via Vite env vars
// (e.g. VITE_APP_STORE_URL) without touching component code.

export const appConfig = {
  // Public name shown in copy where a name is genuinely needed.
  appName: import.meta.env.VITE_APP_NAME || "this app",

  // App Store listing URL. Leave empty to hide App Store CTAs entirely.
  appStoreUrl:
    import.meta.env.VITE_APP_STORE_URL ||
    "https://apps.apple.com/us/app/debatelab/id6782700833",
};