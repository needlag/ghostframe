let ghostFrameId = 0;

export function createGhostFrameId(prefix = "gf"): string {
  ghostFrameId += 1;
  return `${prefix}-${ghostFrameId}`;
}

