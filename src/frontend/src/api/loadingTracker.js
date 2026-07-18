let inFlightCount = 0;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(inFlightCount));
}

export function getInFlightCount() {
  return inFlightCount;
}

export function subscribeLoading(listener) {
  listeners.add(listener);
  listener(inFlightCount);
  return () => listeners.delete(listener);
}

export function trackRequestStart() {
  inFlightCount += 1;
  notify();
}

export function trackRequestEnd() {
  inFlightCount = Math.max(0, inFlightCount - 1);
  notify();
}
