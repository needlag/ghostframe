export function nextFrame(targetWindow: Window): Promise<void> {
  return new Promise((resolve) => {
    targetWindow.requestAnimationFrame(() => resolve());
  });
}

export async function settleAnimation(animation: Animation): Promise<void> {
  try {
    await animation.finished;
  } catch {
    return;
  }
}

