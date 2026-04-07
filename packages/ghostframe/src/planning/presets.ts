import type { GhostFramePreset } from "../types/public";

export const GHOSTFRAME_PRESETS: GhostFramePreset[] = ["fade", "slide", "scale", "morph", "none"];

export function resolvePreset(preset?: GhostFramePreset): GhostFramePreset {
  if (!preset) {
    return "morph";
  }

  return GHOSTFRAME_PRESETS.includes(preset) ? preset : "morph";
}

