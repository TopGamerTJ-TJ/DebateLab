export function isUnMode() {
  try {
    return localStorage.getItem('un_mode') === 'true';
  } catch {
    return false;
  }
}

export function stripModel(str) {
  if (!str || !isUnMode()) return str;
  return str.replace(/\bModel\s+/gi, '');
}

export function setUnMode(on) {
  try {
    localStorage.setItem('un_mode', on ? 'true' : 'false');
    window.dispatchEvent(new Event('un-mode-changed'));
  } catch {}
}