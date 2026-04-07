import type { DOMRectLike } from "./domRects";

export interface FlipDelta {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
}

export function computeFlipDelta(fromRect: DOMRectLike, toRect: DOMRectLike): FlipDelta {
  return {
    translateX: toRect.left - fromRect.left,
    translateY: toRect.top - fromRect.top,
    scaleX: fromRect.width === 0 ? 1 : toRect.width / fromRect.width,
    scaleY: fromRect.height === 0 ? 1 : toRect.height / fromRect.height
  };
}

export function flipTransform(delta: FlipDelta): string {
  return `translate(${delta.translateX}px, ${delta.translateY}px) scale(${delta.scaleX}, ${delta.scaleY})`;
}

