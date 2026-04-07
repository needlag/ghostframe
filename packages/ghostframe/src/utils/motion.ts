import type { MotionDecisionInput } from "../types/internal";

export function shouldReduceMotion(input: MotionDecisionInput): boolean {
  if (input.preference === "reduce") {
    return true;
  }

  if (input.preference === "off") {
    return false;
  }

  return input.prefersReducedMotion;
}

