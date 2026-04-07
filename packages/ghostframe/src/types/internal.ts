import type {
  GhostFrameFeatures,
  GhostFrameHooks,
  GhostFrameMode,
  GhostFrameOptions,
  GhostFramePreset,
  GhostFrameReducedMotion,
  GhostFrameTransitionOptions,
  SharedElementTarget
} from "./public";

export interface GhostFrameResolvedOptions extends GhostFrameHooks {
  duration: number;
  easing: string;
  preset: GhostFramePreset;
  mode: GhostFrameMode;
  debug: boolean;
  autoSharedElements: boolean;
  queueStrategy: "wait" | "skip" | "replace";
  reducedMotion: GhostFrameReducedMotion;
  root?: SharedElementTarget;
}

export interface GhostFrameResolvedTransitionOptions extends GhostFrameHooks {
  duration: number;
  easing: string;
  preset: GhostFramePreset;
  mode: GhostFrameMode;
  debug: boolean;
  autoSharedElements: boolean;
  queueStrategy: "wait" | "skip" | "replace";
  reducedMotion: GhostFrameReducedMotion;
  root?: SharedElementTarget;
  sharedElements: GhostFrameTransitionOptions["sharedElements"];
}

export interface SharedElementDefinition {
  id: string;
  key?: string;
  group?: string;
  from?: SharedElementTarget;
  to?: SharedElementTarget;
  name?: string;
  source: "auto" | "manual";
}

export interface SharedElementCapture {
  definition: SharedElementDefinition;
  element: Element | null;
}

export interface SharedElementMatch {
  id: string;
  key: string;
  group?: string;
  from: Element | null;
  to: Element | null;
  name: string;
}

export interface GhostFramePlanInput {
  defaults: GhostFrameResolvedOptions;
  options: GhostFrameResolvedTransitionOptions;
  features: GhostFrameFeatures;
  sharedElementCount: number;
}

export interface GhostFramePlan {
  mode: "native" | "fallback" | "none";
  requestedMode: GhostFrameMode;
  preset: GhostFramePreset;
  requestedPreset: GhostFramePreset;
  duration: number;
  easing: string;
  reducedMotion: boolean;
  sharedElementsEnabled: boolean;
  sharedElementCount: number;
  root?: SharedElementTarget;
  debug: boolean;
}

export interface MotionDecisionInput {
  preference: GhostFrameReducedMotion;
  prefersReducedMotion: boolean;
}
