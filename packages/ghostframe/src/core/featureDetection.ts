import type { GhostFrameFeatures } from "../types/public";

export type ViewTransitionDocument = Document & {
  startViewTransition?: Document["startViewTransition"];
};

export function detectFeatures(targetWindow?: Window): GhostFrameFeatures {
  if (!targetWindow || !targetWindow.document) {
    return {
      hasDom: false,
      supportsViewTransitions: false,
      supportsWebAnimations: false,
      prefersReducedMotion: false
    };
  }

  const doc = targetWindow.document as ViewTransitionDocument;
  const prefersReducedMotion =
    typeof targetWindow.matchMedia === "function"
      ? targetWindow.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  return {
    hasDom: true,
    supportsViewTransitions: typeof doc.startViewTransition === "function",
    supportsWebAnimations: typeof Element !== "undefined" && typeof Element.prototype.animate === "function",
    prefersReducedMotion
  };
}
