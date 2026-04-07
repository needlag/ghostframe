import { resolvePreset } from "./presets";
import { shouldReduceMotion } from "../utils/motion";
import type { GhostFramePlan, GhostFramePlanInput } from "../types/internal";

export function planTransition(input: GhostFramePlanInput): GhostFramePlan {
  const requestedPreset = resolvePreset(input.options.preset ?? input.defaults.preset);
  const requestedMode = input.options.mode ?? input.defaults.mode;
  const reducedMotion = shouldReduceMotion({
    preference: input.options.reducedMotion ?? input.defaults.reducedMotion,
    prefersReducedMotion: input.features.prefersReducedMotion
  });

  const duration = reducedMotion
    ? Math.min(input.options.duration ?? input.defaults.duration, 140)
    : input.options.duration ?? input.defaults.duration;
  const preset = reducedMotion && requestedPreset !== "none" ? "fade" : requestedPreset;

  let mode: GhostFramePlan["mode"] = "none";
  if (!input.features.hasDom || duration <= 0 || preset === "none") {
    mode = "none";
  } else if (requestedMode === "native" && input.features.supportsViewTransitions) {
    mode = "native";
  } else if (requestedMode === "native" && input.features.supportsWebAnimations) {
    mode = "fallback";
  } else if (requestedMode === "fallback") {
    mode = input.features.supportsWebAnimations ? "fallback" : "none";
  } else if (input.features.supportsViewTransitions) {
    mode = "native";
  } else if (input.features.supportsWebAnimations) {
    mode = "fallback";
  }

  return {
    mode,
    requestedMode,
    preset,
    requestedPreset,
    duration,
    easing: input.options.easing ?? input.defaults.easing,
    reducedMotion,
    sharedElementsEnabled: input.sharedElementCount > 0 && !reducedMotion,
    sharedElementCount: input.sharedElementCount,
    root: input.options.root ?? input.defaults.root,
    debug: input.options.debug ?? input.defaults.debug
  };
}

