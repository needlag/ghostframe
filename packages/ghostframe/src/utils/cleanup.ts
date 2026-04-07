export interface CleanupStack {
  add(cleanup: () => void): void;
  run(): void;
}

export function createCleanupStack(): CleanupStack {
  const callbacks: Array<() => void> = [];
  let cleaned = false;

  return {
    add(cleanup) {
      if (cleaned) {
        cleanup();
        return;
      }

      callbacks.push(cleanup);
    },
    run() {
      if (cleaned) {
        return;
      }

      cleaned = true;
      while (callbacks.length > 0) {
        const callback = callbacks.pop();
        callback?.();
      }
    }
  };
}

