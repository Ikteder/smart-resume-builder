export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function joinLines(value: string[]) {
  return value.join("\n");
}

export function isValidEmail(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidUrl(value: string) {
  if (!value) return true;
  try {
    const parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
    return Boolean(parsed.hostname.includes("."));
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string) {
  if (!value) return "";
  return value.startsWith("http") ? value : `https://${value}`;
}
