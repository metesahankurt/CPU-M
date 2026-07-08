/**
 * Mirror of the Rust `Field<T>` enum. Every value coming from the backend is
 * wrapped so unavailable data renders as a badge instead of crashing the UI.
 */
export type Field<T> =
  | { status: "ok"; value: T }
  | { status: "unavailable" }
  | { status: "requires_admin" };

export function fieldValue<T>(field: Field<T> | undefined): T | undefined {
  return field && field.status === "ok" ? field.value : undefined;
}

export function isOk<T>(
  field: Field<T> | undefined,
): field is { status: "ok"; value: T } {
  return field?.status === "ok";
}
