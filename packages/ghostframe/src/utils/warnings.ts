export function debugLog(debug: boolean, message: string, ...args: unknown[]): void {
  if (!debug) {
    return;
  }

  console.info(`[GhostFrame] ${message}`, ...args);
}

export function warn(debug: boolean, message: string, ...args: unknown[]): void {
  if (!debug) {
    return;
  }

  console.warn(`[GhostFrame] ${message}`, ...args);
}

