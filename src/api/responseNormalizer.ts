type UnknownRecord = Record<string, unknown>;

export interface ApiEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: UnknownRecord;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasOwn = (value: UnknownRecord, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const hasPaginationMeta = (meta: UnknownRecord): boolean =>
  hasOwn(meta, "total") ||
  hasOwn(meta, "per_page") ||
  hasOwn(meta, "current_page") ||
  hasOwn(meta, "last_page");

export const isApiEnvelope = (value: unknown): value is ApiEnvelope<unknown> => {
  if (!isRecord(value)) {
    return false;
  }

  return hasOwn(value, "success") || hasOwn(value, "message") || hasOwn(value, "meta");
};

const normalizePaginatedEnvelope = (data: unknown, meta: UnknownRecord): UnknownRecord => {
  const normalized: UnknownRecord = {
    data,
    meta,
    ...meta,
  };

  if (!hasOwn(normalized, "page") && hasOwn(meta, "current_page")) {
    normalized.page = meta.current_page;
  }

  if (!hasOwn(normalized, "current_page") && hasOwn(meta, "page")) {
    normalized.current_page = meta.page;
  }

  if (!hasOwn(normalized, "total") && Array.isArray(data)) {
    normalized.total = data.length;
  }

  return normalized;
};

export const normalizeApiResponse = <T>(payload: unknown): T => {
  if (!isApiEnvelope(payload)) {
    return payload as T;
  }

  const envelope = payload as ApiEnvelope<unknown>;

  if (Array.isArray(envelope.data) && isRecord(envelope.meta) && hasPaginationMeta(envelope.meta)) {
    return normalizePaginatedEnvelope(envelope.data ?? [], envelope.meta) as T;
  }

  if (Object.prototype.hasOwnProperty.call(envelope, "data")) {
    return envelope.data as T;
  }

  return payload as T;
};
