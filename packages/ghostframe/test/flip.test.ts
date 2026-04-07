import { describe, expect, it } from "vitest";
import { computeFlipDelta, flipTransform } from "../src/fallback/flip";

describe("computeFlipDelta", () => {
  it("computes translation and scale between boxes", () => {
    const delta = computeFlipDelta(
      { top: 10, left: 20, width: 100, height: 50, right: 120, bottom: 60 },
      { top: 40, left: 60, width: 200, height: 100, right: 260, bottom: 140 }
    );

    expect(delta).toEqual({
      translateX: 40,
      translateY: 30,
      scaleX: 2,
      scaleY: 2
    });
    expect(flipTransform(delta)).toBe("translate(40px, 30px) scale(2, 2)");
  });
});

