import { describe, expect, it } from "vitest";
import { planTransition } from "../src/planning/planTransition";
import type { GhostFramePlanInput } from "../src/types/internal";

const baseInput: GhostFramePlanInput = {
  defaults: {
    duration: 450,
    easing: "ease",
    preset: "morph",
    mode: "auto",
    debug: false,
    autoSharedElements: false,
    queueStrategy: "wait",
    reducedMotion: "auto",
    onBeforeTransition: undefined,
    onAfterTransition: undefined,
    onError: undefined,
    root: "#app"
  },
  options: {
    duration: 450,
    easing: "ease",
    preset: "morph",
    mode: "auto",
    debug: false,
    autoSharedElements: false,
    queueStrategy: "wait",
    reducedMotion: "auto",
    sharedElements: [],
    onBeforeTransition: undefined,
    onAfterTransition: undefined,
    onError: undefined,
    root: "#app"
  },
  features: {
    hasDom: true,
    supportsViewTransitions: true,
    supportsWebAnimations: true,
    prefersReducedMotion: false
  },
  sharedElementCount: 2
};

describe("planTransition", () => {
  it("prefers native mode when available", () => {
    const plan = planTransition(baseInput);
    expect(plan.mode).toBe("native");
    expect(plan.preset).toBe("morph");
    expect(plan.sharedElementsEnabled).toBe(true);
  });

  it("falls back to WAAPI when native is unavailable", () => {
    const plan = planTransition({
      ...baseInput,
      features: {
        ...baseInput.features,
        supportsViewTransitions: false
      }
    });

    expect(plan.mode).toBe("fallback");
  });

  it("reduces motion to a short fade", () => {
    const plan = planTransition({
      ...baseInput,
      features: {
        ...baseInput.features,
        prefersReducedMotion: true
      }
    });

    expect(plan.preset).toBe("fade");
    expect(plan.duration).toBe(140);
    expect(plan.sharedElementsEnabled).toBe(false);
  });

  it("skips animation when duration is zero", () => {
    const plan = planTransition({
      ...baseInput,
      options: {
        ...baseInput.options,
        duration: 0
      }
    });

    expect(plan.mode).toBe("none");
  });
});

