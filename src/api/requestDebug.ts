import type { Method } from "axios";

type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableValue[]
  | { [key: string]: SerializableValue };

function serializeFormDataValue(value: FormDataEntryValue): SerializableValue {
  if (value instanceof File) {
    return {
      __type: "File",
      name: value.name,
      size: value.size,
      mimeType: value.type || "application/octet-stream",
    };
  }

  if (value === "[]") {
    return [];
  }

  return value;
}

export function serializeFormData(
  data: FormData
): Record<string, SerializableValue> {
  const serializedBody: Record<string, SerializableValue> = {};

  for (const [key, value] of data.entries()) {
    const serializedValue = serializeFormDataValue(value);
    const currentValue = serializedBody[key];

    if (currentValue === undefined) {
      serializedBody[key] = serializedValue;
      continue;
    }

    serializedBody[key] = Array.isArray(currentValue)
      ? [...currentValue, serializedValue]
      : [currentValue, serializedValue];
  }

  return serializedBody;
}

export function logApiRequest(
  method: Method,
  url: string,
  params: Record<string, unknown> = {},
  body?: unknown,
  contentType:
    | "application/json"
    | "multipart/form-data" = "application/json"
): void {
  const payload = body ?? params;

  console.log(
    `[HTTP ${method.toUpperCase()}] payload ${contentType} ${url}\n${JSON.stringify(
      payload,
      null,
      2
    )}`
  );
}
