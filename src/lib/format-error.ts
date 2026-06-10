/** Turn API / wallet errors into human-readable strings (never "[object Object]"). */
export function formatErrorMessage(
  value: unknown,
  fallback = "Something went wrong."
): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value instanceof Error) return value.message.trim() || fallback;

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message.trim();
    }
    if (typeof record.error === "string" && record.error.trim()) {
      return record.error.trim();
    }
    if (record.error && typeof record.error === "object") {
      const nested = formatErrorMessage(record.error, "");
      if (nested) return nested;
    }
    try {
      const json = JSON.stringify(value);
      if (json && json !== "{}") return json;
    } catch {
      /* ignore */
    }
  }

  return fallback;
}