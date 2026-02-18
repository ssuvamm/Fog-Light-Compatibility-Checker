export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function makeVisitorId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `visitor-${Date.now()}`;
}
