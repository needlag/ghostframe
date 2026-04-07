import { describe, expect, it } from "vitest";
import { resolvePreset } from "../src/planning/presets";

describe("resolvePreset", () => {
  it("uses morph by default", () => {
    expect(resolvePreset()).toBe("morph");
  });

  it("returns known presets unchanged", () => {
    expect(resolvePreset("fade")).toBe("fade");
    expect(resolvePreset("slide")).toBe("slide");
    expect(resolvePreset("scale")).toBe("scale");
    expect(resolvePreset("morph")).toBe("morph");
    expect(resolvePreset("none")).toBe("none");
  });
});
