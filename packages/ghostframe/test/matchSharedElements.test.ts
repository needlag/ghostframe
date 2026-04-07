import { describe, expect, it } from "vitest";
import {
  buildSharedElementDefinitions,
  captureSharedElementPhase,
  matchSharedElementCaptures,
  resolveSharedElementMatches
} from "../src/planning/matchSharedElements";

describe("shared-element matching", () => {
  it("matches identical data-gf-key values automatically", () => {
    const fromRoot = document.createElement("div");
    const toRoot = document.createElement("div");

    fromRoot.innerHTML = `<article data-gf-key="card-image" data-gf-group="catalog"></article>`;
    toRoot.innerHTML = `<article data-gf-key="card-image" data-gf-group="catalog"></article>`;

    const matches = resolveSharedElementMatches({
      fromRoot,
      toRoot,
      options: {
        autoSharedElements: true,
        sharedElements: []
      }
    });

    expect(matches).toHaveLength(1);
    expect(matches[0]?.from).toBeInstanceOf(Element);
    expect(matches[0]?.to).toBeInstanceOf(Element);
    expect(matches[0]?.key).toBe("card-image");
  });

  it("supports manual selectors and ignores missing targets safely", () => {
    const fromRoot = document.createElement("div");
    const toRoot = document.createElement("div");

    fromRoot.innerHTML = `<div class="source"></div>`;
    toRoot.innerHTML = `<div class="target"></div>`;

    const definitions = buildSharedElementDefinitions({
      root: fromRoot,
      registry: new Map(),
      debug: false,
      options: {
        autoSharedElements: false,
        sharedElements: [{ key: "hero", from: ".source", to: ".target" }, { key: "ghost", from: ".missing", to: ".missing" }]
      }
    });

    const before = captureSharedElementPhase({
      definitions,
      root: fromRoot,
      registry: new Map(),
      phase: "from"
    });
    const after = captureSharedElementPhase({
      definitions,
      root: toRoot,
      registry: new Map(),
      phase: "to"
    });
    const matches = matchSharedElementCaptures(before, after);

    expect(matches).toHaveLength(2);
    expect(matches[0]?.from).toBeInstanceOf(Element);
    expect(matches[0]?.to).toBeInstanceOf(Element);
    expect(matches[1]?.from).toBeNull();
    expect(matches[1]?.to).toBeNull();
  });

  it("uses registered resolvers when a key has no matching selector", () => {
    const fromRoot = document.createElement("div");
    const toRoot = document.createElement("div");
    const registered = document.createElement("div");
    registered.dataset.gfKey = "hero";
    toRoot.appendChild(registered);

    const matches = resolveSharedElementMatches({
      fromRoot,
      toRoot,
      registry: new Map([["hero", () => registered]]),
      options: {
        autoSharedElements: false,
        sharedElements: ["hero"]
      }
    });

    expect(matches[0]?.to).toBe(registered);
  });
});

