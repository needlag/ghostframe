import { describe, expect, it } from "vitest";
import { createOverlayRoot } from "../src/fallback/overlay";
import { createCleanupStack } from "../src/utils/cleanup";

describe("cleanup helpers", () => {
  it("runs cleanup callbacks only once in reverse order", () => {
    const stack = createCleanupStack();
    const order: string[] = [];

    stack.add(() => order.push("first"));
    stack.add(() => order.push("second"));

    stack.run();
    stack.run();

    expect(order).toEqual(["second", "first"]);
  });

  it("creates overlay containers that can be removed cleanly", () => {
    const overlay = createOverlayRoot(document);
    expect(document.body.contains(overlay)).toBe(true);

    overlay.remove();
    expect(document.body.contains(overlay)).toBe(false);
  });
});

