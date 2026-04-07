export { createGhostFrame } from "./core/createGhostFrame";
export { detectFeatures } from "./core/featureDetection";
export { resolvePreset } from "./planning/presets";
export { planTransition } from "./planning/planTransition";
export { computeFlipDelta, flipTransform } from "./fallback/flip";
export {
  buildSharedElementDefinitions,
  captureSharedElementPhase,
  matchSharedElementCaptures,
  resolveSharedElementMatches
} from "./planning/matchSharedElements";
export type {
  GhostFrame,
  GhostFrameFeatures,
  GhostFrameMode,
  GhostFrameOptions,
  GhostFramePreset,
  GhostFrameQueueStrategy,
  GhostFrameReducedMotion,
  GhostFrameTransitionContext,
  GhostFrameTransitionOptions,
  GhostFrameTransitionResult,
  SharedElementConfig,
  SharedElementTarget
} from "./types/public";

