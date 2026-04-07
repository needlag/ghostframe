import type { GhostFramePlan } from "./internal";

export type GhostFramePreset = "fade" | "slide" | "scale" | "morph" | "none";
export type GhostFrameMode = "auto" | "native" | "fallback";
export type GhostFrameQueueStrategy = "wait" | "skip" | "replace";
export type GhostFrameReducedMotion = "auto" | "reduce" | "off";
export type SharedElementTarget =
  | string
  | Element
  | null
  | undefined
  | (() => Element | null | undefined);

export interface SharedElementConfig {
  key?: string;
  from?: SharedElementTarget;
  to?: SharedElementTarget;
  group?: string;
  name?: string;
}

export interface GhostFrameHooks {
  onBeforeTransition?: (context: GhostFrameTransitionContext) => void | Promise<void>;
  onAfterTransition?: (context: GhostFrameTransitionContext, result: GhostFrameTransitionResult) => void | Promise<void>;
  onError?: (error: unknown, context: GhostFrameTransitionContext) => void | Promise<void>;
}

export interface GhostFrameOptions extends GhostFrameHooks {
  root?: SharedElementTarget;
  duration?: number;
  easing?: string;
  preset?: GhostFramePreset;
  mode?: GhostFrameMode;
  debug?: boolean;
  autoSharedElements?: boolean;
  queueStrategy?: GhostFrameQueueStrategy;
  reducedMotion?: GhostFrameReducedMotion;
}

export interface GhostFrameTransitionOptions extends GhostFrameHooks {
  root?: SharedElementTarget;
  duration?: number;
  easing?: string;
  preset?: GhostFramePreset;
  mode?: GhostFrameMode;
  debug?: boolean;
  autoSharedElements?: boolean;
  queueStrategy?: GhostFrameQueueStrategy;
  reducedMotion?: GhostFrameReducedMotion;
  sharedElements?: Array<string | SharedElementConfig>;
}

export interface GhostFrameFeatures {
  hasDom: boolean;
  supportsViewTransitions: boolean;
  supportsWebAnimations: boolean;
  prefersReducedMotion: boolean;
}

export interface GhostFrameTransitionContext {
  id: string;
  plan: Pick<
    GhostFramePlan,
    | "mode"
    | "requestedMode"
    | "preset"
    | "requestedPreset"
    | "duration"
    | "easing"
    | "reducedMotion"
    | "sharedElementCount"
  >;
  features: GhostFrameFeatures;
}

export interface GhostFrameTransitionResult {
  id: string;
  status: "completed" | "skipped" | "cancelled";
  mode: "native" | "fallback" | "none";
  preset: GhostFramePreset;
  reducedMotion: boolean;
  sharedElements: number;
}

export interface GhostFrame {
  transition(
    update: () => void | Promise<void>,
    options?: GhostFrameTransitionOptions
  ): Promise<GhostFrameTransitionResult>;
  registerSharedElement(
    key: string,
    resolver: () => Element | null | undefined
  ): () => void;
  clearSharedElements(): void;
  cancelPending(reason?: string): void;
  skipCurrent(reason?: string): void;
  getFeatures(): GhostFrameFeatures;
  isRunning(): boolean;
}
