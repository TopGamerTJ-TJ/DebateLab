// Small helpers around native device capabilities.
// These make the app behave like a real native app (haptics, share sheet)
// rather than a plain website wrapper.

export function haptic(pattern = 10) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {
    // vibration not supported — ignore silently
  }
}

export function canShare() {
  return typeof navigator !== "undefined" && !!navigator.share;
}

// Opens the native share sheet when available, otherwise copies to clipboard.
// Returns "shared" | "copied" | "failed".
export async function shareContent({ title, text, url }) {
  try {
    if (canShare()) {
      await navigator.share({ title, text, url });
      return "shared";
    }
  } catch (err) {
    // User cancelled the share sheet — treat as no-op.
    if (err && err.name === "AbortError") return "failed";
  }
  try {
    const clip = [title, text, url].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(clip);
    return "copied";
  } catch {
    return "failed";
  }
}