export type FieldErrorValue = string | string[] | null | undefined;
export type FieldErrors = Record<string, FieldErrorValue>;

export function normalizeFieldError(error: FieldErrorValue): string {
  if (Array.isArray(error)) {
    return error.filter((item): item is string => typeof item === "string" && item.trim().length > 0).join(" ");
  }

  if (typeof error === "string") {
    return error;
  }

  return "";
}

export function getFieldError(
  errors: Record<string, unknown> | undefined,
  ...keys: string[]
): string {
  if (!errors) return "";

  for (const key of keys) {
    const value = errors[key];
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return normalizeFieldError(value as string[]);
  }

  return "";
}

