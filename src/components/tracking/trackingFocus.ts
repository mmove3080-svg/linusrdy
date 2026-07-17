/**
 * Tiny event bus so the navbar can ask the tracking input to focus + glow
 * without prop drilling across the tree.
 */
const EVENT = "linus:focus-tracking";

export function requestTrackingFocus(): void {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onTrackingFocusRequest(handler: () => void): () => void {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
