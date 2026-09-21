export function createSessionHref(ymd: string) {
  return `/schedule/new?date=${ymd}`;
}

export function editSessionHref(sessionId: string) {
  return `/schedule/${sessionId}`;
}

export function rosterHref(sessionId: string) {
  return `/sessions/${sessionId}/roster`;
}
