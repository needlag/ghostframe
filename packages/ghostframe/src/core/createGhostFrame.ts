import { detectFeatures, type ViewTransitionDocument } from "./featureDetection";
import { TransitionQueue, type TransitionController } from "./queue";
import { buildSharedElementDefinitions, captureSharedElementPhase, matchSharedElementCaptures } from "../planning/matchSharedElements";
import { planTransition } from "../planning/planTransition";
import { GhostFrameError } from "./errors";
import { runFallbackTransition } from "../fallback/runFallbackTransition";
import { runNativeTransition } from "../native/runNativeTransition";
import { createGhostFrameId } from "../utils/ids";
import { resolveRootElement } from "../utils/selectors";
import { debugLog, warn } from "../utils/warnings";
import type {
  GhostFrame,
  GhostFrameOptions,
  GhostFrameTransitionContext,
  GhostFrameTransitionOptions,
  GhostFrameTransitionResult
} from "../types/public";
import type {
  GhostFrameResolvedOptions,
  GhostFrameResolvedTransitionOptions,
  SharedElementDefinition
} from "../types/internal";

const DEFAULTS: GhostFrameResolvedOptions = {
  duration: 450,
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  preset: "morph",
  mode: "auto",
  debug: false,
  autoSharedElements: false,
  queueStrategy: "wait",
  reducedMotion: "auto",
  onBeforeTransition: undefined,
  onAfterTransition: undefined,
  onError: undefined,
  root: undefined
};

function mergeOptions(
  defaults: GhostFrameResolvedOptions,
  options?: GhostFrameTransitionOptions
): GhostFrameResolvedTransitionOptions {
  return {
    duration: options?.duration ?? defaults.duration,
    easing: options?.easing ?? defaults.easing,
    preset: options?.preset ?? defaults.preset,
    mode: options?.mode ?? defaults.mode,
    debug: options?.debug ?? defaults.debug,
    autoSharedElements: options?.autoSharedElements ?? defaults.autoSharedElements,
    queueStrategy: options?.queueStrategy ?? defaults.queueStrategy,
    reducedMotion: options?.reducedMotion ?? defaults.reducedMotion,
    sharedElements: options?.sharedElements ?? [],
    onBeforeTransition: options?.onBeforeTransition,
    onAfterTransition: options?.onAfterTransition,
    onError: options?.onError,
    root: options?.root ?? defaults.root
  };
}

function createSkippedResult(
  id: string,
  context: Pick<GhostFrameTransitionContext["plan"], "preset" | "reducedMotion">,
  reason: "skipped" | "cancelled"
): GhostFrameTransitionResult {
  return {
    id,
    status: reason,
    mode: "none",
    preset: context.preset,
    reducedMotion: context.reducedMotion,
    sharedElements: 0
  };
}

async function runHook(
  hook: ((...args: any[]) => void | Promise<void>) | undefined,
  ...args: unknown[]
): Promise<void> {
  if (!hook) {
    return;
  }

  await hook(...args);
}

export function createGhostFrame(options: GhostFrameOptions = {}): GhostFrame {
  const defaults: GhostFrameResolvedOptions = {
    ...DEFAULTS,
    ...options
  };
  const registry = new Map<string, () => Element | null | undefined>();
  const queue = new TransitionQueue<GhostFrameTransitionResult>();

  function getActiveWindow(): Window | undefined {
    return typeof window !== "undefined" ? window : undefined;
  }

  async function executeTransition(
    controller: TransitionController,
    update: () => void | Promise<void>,
    options?: GhostFrameTransitionOptions
  ): Promise<GhostFrameTransitionResult> {
    const targetWindow = getActiveWindow();
    const features = detectFeatures(targetWindow);
    const resolved = mergeOptions(defaults, options);
    const root = resolveRootElement(resolved.root, targetWindow?.document);
    const definitions = buildSharedElementDefinitions({
      root,
      options: resolved,
      registry,
      debug: resolved.debug
    });
    const plan = planTransition({
      defaults,
      options: resolved,
      features,
      sharedElementCount: definitions.length
    });
    const id = createGhostFrameId("gf-run");
    const context: GhostFrameTransitionContext = {
      id,
      features,
      plan: {
        mode: plan.mode,
        requestedMode: plan.requestedMode,
        preset: plan.preset,
        requestedPreset: plan.requestedPreset,
        duration: plan.duration,
        easing: plan.easing,
        reducedMotion: plan.reducedMotion,
        sharedElementCount: plan.sharedElementCount
      }
    };

    if (controller.isCancelRequested()) {
      return createSkippedResult(id, context.plan, "cancelled");
    }

    try {
      await runHook(defaults.onBeforeTransition, context);
      await runHook(resolved.onBeforeTransition, context);

      if (!features.hasDom) {
        await Promise.resolve(update());
        const result: GhostFrameTransitionResult = {
          id,
          status: "completed",
          mode: "none",
          preset: plan.preset,
          reducedMotion: plan.reducedMotion,
          sharedElements: 0
        };
        await runHook(defaults.onAfterTransition, context, result);
        await runHook(resolved.onAfterTransition, context, result);
        return result;
      }

      if (!root) {
        throw new GhostFrameError("MISSING_ROOT", "GhostFrame could not resolve the transition root.");
      }

      if (plan.mode === "none" || controller.isSkipRequested()) {
        await Promise.resolve(update());
        const result: GhostFrameTransitionResult = {
          id,
          status: controller.isSkipRequested() ? "skipped" : "completed",
          mode: "none",
          preset: plan.preset,
          reducedMotion: plan.reducedMotion,
          sharedElements: 0
        };
        await runHook(defaults.onAfterTransition, context, result);
        await runHook(resolved.onAfterTransition, context, result);
        return result;
      }

      const before = captureSharedElementPhase({
        definitions,
        root,
        registry,
        phase: "from"
      });

      const captureAfter = (sharedDefinitions: SharedElementDefinition[]) =>
        captureSharedElementPhase({
          definitions: sharedDefinitions,
          root: resolveRootElement(plan.root, targetWindow?.document),
          registry,
          phase: "to"
        });

      let sharedCount = 0;
      if (plan.mode === "native") {
        sharedCount = await runNativeTransition({
          plan,
          doc: targetWindow?.document as ViewTransitionDocument,
          update,
          before,
          captureAfter,
          matchCaptures: matchSharedElementCaptures,
          controller
        });
      } else {
        if (!features.supportsWebAnimations) {
          warn(plan.debug, "Web Animations are unavailable, GhostFrame will update without animation.");
          await Promise.resolve(update());
        } else {
          sharedCount = await runFallbackTransition({
            plan,
            doc: targetWindow!.document,
            update,
            before,
            captureAfter,
            matchCaptures: matchSharedElementCaptures,
            controller
          });
        }
      }

      const result: GhostFrameTransitionResult = {
        id,
        status: controller.isCancelRequested() ? "cancelled" : controller.isSkipRequested() ? "skipped" : "completed",
        mode: plan.mode,
        preset: plan.preset,
        reducedMotion: plan.reducedMotion,
        sharedElements: plan.sharedElementsEnabled ? sharedCount : 0
      };
      await runHook(defaults.onAfterTransition, context, result);
      await runHook(resolved.onAfterTransition, context, result);
      debugLog(plan.debug, `Transition ${id} finished in ${plan.mode} mode.`, result);
      return result;
    } catch (error) {
      await runHook(defaults.onError, error, context);
      await runHook(resolved.onError, error, context);
      throw error;
    }
  }

  return {
    transition(update, options) {
      const resolved = mergeOptions(defaults, options);
      const ephemeralId = createGhostFrameId("gf-pending");
      const snapshot = {
        preset: resolved.preset,
        reducedMotion: resolved.reducedMotion === "reduce"
      };

      return queue.enqueue(
        (controller) => executeTransition(controller, update, options),
        {
          strategy: resolved.queueStrategy,
          onSkip: (reason) =>
            createSkippedResult(ephemeralId, snapshot, reason === "cancelled" ? "cancelled" : "skipped")
        }
      );
    },
    registerSharedElement(key, resolver) {
      registry.set(key, resolver);
      return () => {
        if (registry.get(key) === resolver) {
          registry.delete(key);
        }
      };
    },
    clearSharedElements() {
      registry.clear();
    },
    cancelPending(reason) {
      queue.cancelPending(reason);
    },
    skipCurrent(reason) {
      queue.skipCurrent(reason);
    },
    getFeatures() {
      return detectFeatures(getActiveWindow());
    },
    isRunning() {
      return queue.isRunning();
    }
  };
}

