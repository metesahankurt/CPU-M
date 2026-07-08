import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']"),
  );
}

export function useNativeAppGuards() {
  useEffect(() => {
    const preventSelectAll = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "a" &&
        !isEditableTarget(event.target)
      ) {
        event.preventDefault();
      }
    };

    const preventNativeGesture = (event: Event) => {
      if (!isEditableTarget(event.target)) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", preventSelectAll, true);
    document.addEventListener("selectstart", preventNativeGesture, true);
    document.addEventListener("dragstart", preventNativeGesture, true);
    return () => {
      document.removeEventListener("keydown", preventSelectAll, true);
      document.removeEventListener("selectstart", preventNativeGesture, true);
      document.removeEventListener("dragstart", preventNativeGesture, true);
    };
  }, []);
}
