import type { ViewTransitionDocument } from "../core/featureDetection";
import type {
  GhostFramePlan,
  SharedElementCapture,
  SharedElementDefinition,
  SharedElementMatch
} from "../types/internal";
import { createCleanupStack } from "../utils/cleanup";
import { ensureNativeStyles } from "./nativeStyles";

interface NativeTransitionInput {
  plan: GhostFramePlan;
  doc: ViewTransitionDocument;
  update: () => void | Promise<void>;
  before: SharedElementCapture[];
  captureAfter: (definitions: SharedElementDefinition[]) => SharedElementCapture[];
  matchCaptures: (before: SharedElementCapture[], after: SharedElementCapture[]) => SharedElementMatch[];
  controller: {
    isSkipRequested(): boolean;
  };
}

export async function runNativeTransition(input: NativeTransitionInput): Promise<number> {
  const startViewTransition = input.doc.startViewTransition;
  if (!startViewTransition) {
    throw new Error("View Transitions are not available.");
  }

  ensureNativeStyles(input.doc);
  const cleanup = createCleanupStack();
  const root = input.doc.documentElement;
  const matches = input.before.filter((entry) => entry.element);

  root.classList.add("gf-native", `gf-preset-${input.plan.preset}`);
  root.style.setProperty("--gf-duration", `${input.plan.duration}ms`);
  root.style.setProperty("--gf-easing", input.plan.easing);
  cleanup.add(() => {
    root.classList.remove("gf-native", `gf-preset-${input.plan.preset}`);
    root.style.removeProperty("--gf-duration");
    root.style.removeProperty("--gf-easing");
  });

  for (const entry of matches) {
    const element = entry.element as HTMLElement;
    const previous = element.style.viewTransitionName;
    element.style.viewTransitionName = entry.definition.name ?? `gf-${entry.definition.id}`;
    cleanup.add(() => {
      element.style.viewTransitionName = previous;
    });
  }

  const transition = startViewTransition(async () => {
    await Promise.resolve(input.update());
    const after = input.captureAfter(input.before.map((entry) => entry.definition));
    const paired = input.matchCaptures(input.before, after).filter((match) => match.from && match.to);

    for (const pair of paired) {
      const target = pair.to as HTMLElement;
      const previous = target.style.viewTransitionName;
      target.style.viewTransitionName = pair.name;
      cleanup.add(() => {
        target.style.viewTransitionName = previous;
      });
    }
  });

  if (input.controller.isSkipRequested()) {
    transition.skipTransition?.();
  }

  await transition.finished.finally(() => cleanup.run());
  return matches.length;
}

