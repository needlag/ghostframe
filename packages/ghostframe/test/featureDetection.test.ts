import { describe, expect, it, vi } from "vitest";
import { detectFeatures } from "../src/core/featureDetection";

describe("detectFeatures", () => {
  it("returns a safe SSR shape when no window is available", () => {
    expect(detectFeatures(undefined)).toEqual({
      hasDom: false,
      supportsViewTransitions: false,
      supportsWebAnimations: false,
      prefersReducedMotion: false
    });
  });

  it("detects native, waapi, and reduced-motion capabilities", () => {
    const targetWindow = window;
    const originalAnimate = targetWindow.Element.prototype.animate;
    const originalMatchMedia = targetWindow.matchMedia;
    const documentWithNative = targetWindow.document as Document & {
      startViewTransition?: () => unknown;
    };
    const originalStart = documentWithNative.startViewTransition;

    targetWindow.Element.prototype.animate = vi.fn();
    documentWithNative.startViewTransition = vi.fn();
    targetWindow.matchMedia = vi.fn().mockReturnValue({ matches: true });

    expect(detectFeatures(targetWindow)).toEqual({
      hasDom: true,
      supportsViewTransitions: true,
      supportsWebAnimations: true,
      prefersReducedMotion: true
    });

    targetWindow.Element.prototype.animate = originalAnimate;
    documentWithNative.startViewTransition = originalStart;
    targetWindow.matchMedia = originalMatchMedia;
  });
});

