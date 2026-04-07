import { GhostFrameError } from "../core/errors";
import { readRect } from "./domRects";
import { computeFlipDelta, flipTransform } from "./flip";
import { cloneIntoOverlay, createOverlayRoot } from "./overlay";
import { createCleanupStack } from "../utils/cleanup";
import { nextFrame, settleAnimation } from "../utils/promises";
import { resolveRootElement } from "../utils/selectors";
import type {
  GhostFramePlan,
  SharedElementCapture,
  SharedElementDefinition,
  SharedElementMatch
} from "../types/internal";

interface FallbackTransitionInput {
  plan: GhostFramePlan;
  doc: Document;
  update: () => void | Promise<void>;
  before: SharedElementCapture[];
  captureAfter: (definitions: SharedElementDefinition[]) => SharedElementCapture[];
  matchCaptures: (before: SharedElementCapture[], after: SharedElementCapture[]) => SharedElementMatch[];
  controller: {
    isSkipRequested(): boolean;
    isCancelRequested(): boolean;
  };
}

function rootKeyframes(preset: GhostFramePlan["preset"], phase: "in" | "out"): Keyframe[] {
  if (preset === "slide") {
    return phase === "in"
      ? [
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 1, transform: "translateY(0px)" }
        ]
      : [
          { opacity: 1, transform: "translateY(0px)" },
          { opacity: 0, transform: "translateY(-18px)" }
        ];
  }

  if (preset === "scale") {
    return phase === "in"
      ? [
          { opacity: 0, transform: "scale(0.985)" },
          { opacity: 1, transform: "scale(1)" }
        ]
      : [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.015)" }
        ];
  }

  if (preset === "morph") {
    return phase === "in"
      ? [
          { opacity: 0, transform: "translateY(10px) scale(0.99)" },
          { opacity: 1, transform: "translateY(0px) scale(1)" }
        ]
      : [
          { opacity: 1, transform: "translateY(0px) scale(1)" },
          { opacity: 0, transform: "translateY(-10px) scale(1.01)" }
        ];
  }

  return phase === "in" ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }];
}

function hideElement(element: HTMLElement): () => void {
  const previousVisibility = element.style.visibility;
  const previousOpacity = element.style.opacity;
  element.style.visibility = "hidden";
  element.style.opacity = "0";

  return () => {
    element.style.visibility = previousVisibility;
    element.style.opacity = previousOpacity;
  };
}

export async function runFallbackTransition(input: FallbackTransitionInput): Promise<number> {
  const root = resolveRootElement(input.plan.root, input.doc);
  if (!root) {
    throw new GhostFrameError("MISSING_ROOT", "GhostFrame could not resolve a transition root.");
  }

  if (input.controller.isCancelRequested()) {
    return 0;
  }

  const cleanup = createCleanupStack();
  const overlay = createOverlayRoot(input.doc);
  cleanup.add(() => overlay.remove());

  const rootRect = readRect(root);
  const rootClone = cloneIntoOverlay(overlay, root, rootRect);

  const previousOpacity = (root as HTMLElement).style.opacity;
  const previousTransform = (root as HTMLElement).style.transform;
  cleanup.add(() => {
    (root as HTMLElement).style.opacity = previousOpacity;
    (root as HTMLElement).style.transform = previousTransform;
  });

  await Promise.resolve(input.update());
  if (input.controller.isCancelRequested()) {
    cleanup.run();
    return 0;
  }

  const liveRoot = resolveRootElement(input.plan.root, input.doc) ?? root;
  const after = input.captureAfter(input.before.map((entry) => entry.definition));
  const matches = input.matchCaptures(input.before, after).filter((match) => match.from && match.to);
  const animations: Animation[] = [];
  const initialInKeyframe = rootKeyframes(input.plan.preset, "in")[0];

  (liveRoot as HTMLElement).style.opacity = "0";
  (liveRoot as HTMLElement).style.transform = String(initialInKeyframe.transform ?? "");

  for (const match of matches) {
    if (input.controller.isSkipRequested()) {
      break;
    }

    const fromElement = match.from as HTMLElement;
    const toElement = match.to as HTMLElement;
    const targetCleanup = hideElement(toElement);
    cleanup.add(targetCleanup);

    const fromRect = readRect(fromElement);
    const toRect = readRect(toElement);
    const clone = cloneIntoOverlay(overlay, fromElement, fromRect);
    const delta = computeFlipDelta(fromRect, toRect);

    animations.push(
      clone.animate(
        [
          { transform: "translate(0px, 0px) scale(1, 1)", opacity: 1, borderRadius: getComputedStyle(fromElement).borderRadius },
          { transform: flipTransform(delta), opacity: 0.98, borderRadius: getComputedStyle(toElement).borderRadius }
        ],
        {
          duration: input.plan.duration,
          easing: input.plan.easing,
          fill: "forwards"
        }
      )
    );
    cleanup.add(() => clone.remove());
  }

  await nextFrame(input.doc.defaultView ?? window);

  if (!input.controller.isSkipRequested()) {
    animations.push(
      rootClone.animate(rootKeyframes(input.plan.preset, "out"), {
        duration: input.plan.duration,
        easing: input.plan.easing,
        fill: "forwards"
      })
    );
    animations.push(
      (liveRoot as HTMLElement).animate(rootKeyframes(input.plan.preset, "in"), {
        duration: input.plan.duration,
        easing: input.plan.easing,
        fill: "forwards"
      })
    );
  }

  if (input.controller.isSkipRequested()) {
    for (const animation of animations) {
      animation.cancel();
    }
    cleanup.run();
    return matches.length;
  }

  await Promise.all(animations.map(settleAnimation));
  cleanup.run();
  return matches.length;
}
