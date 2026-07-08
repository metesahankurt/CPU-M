pub mod cpu;
pub mod display;
pub mod gpu;
pub mod memory;
pub mod platform;
pub mod storage;
pub mod system;

use serde::Serialize;

/// A single piece of system information.
///
/// Every value surfaced to the UI is wrapped in a `Field` so that data that
/// cannot be read on the current machine renders as "unavailable" instead of
/// breaking the page. Serialized as `{ "status": "ok", "value": ... }`,
/// `{ "status": "unavailable" }` or `{ "status": "requires_admin" }`.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "status", content = "value", rename_all = "snake_case")]
pub enum Field<T> {
    Ok(T),
    Unavailable,
    RequiresAdmin,
}

impl<T> Field<T> {
    pub fn from_option(value: Option<T>) -> Self {
        match value {
            Some(v) => Field::Ok(v),
            None => Field::Unavailable,
        }
    }

    pub fn map<U, F: FnOnce(T) -> U>(self, f: F) -> Field<U> {
        match self {
            Field::Ok(v) => Field::Ok(f(v)),
            Field::Unavailable => Field::Unavailable,
            Field::RequiresAdmin => Field::RequiresAdmin,
        }
    }
}

impl<T> From<Option<T>> for Field<T> {
    fn from(value: Option<T>) -> Self {
        Field::from_option(value)
    }
}
