import { createGhostFrameId } from "../utils/ids";
import { buildSharedElementSelector, resolveElementTarget } from "../utils/selectors";
import { warn } from "../utils/warnings";
import type {
  SharedElementCapture,
  SharedElementDefinition,
  SharedElementMatch
} from "../types/internal";
import type { GhostFrameTransitionOptions } from "../types/public";

type SharedElementRegistry = Map<string, () => Element | null | undefined>;

interface BuildDefinitionsInput {
  root: ParentNode | null;
  options: Pick<GhostFrameTransitionOptions, "autoSharedElements" | "sharedElements">;
  registry: SharedElementRegistry;
  debug: boolean;
}

function collectAutoDefinitions(root: ParentNode, debug: boolean): SharedElementDefinition[] {
  const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-gf-key]:not([data-gf-ignore])"));
  const seen = new Set<string>();
  const definitions: SharedElementDefinition[] = [];

  for (const element of elements) {
    const key = element.dataset.gfKey;
    if (!key) {
      continue;
    }

    const group = element.dataset.gfGroup;
    const identity = `${group ?? ""}::${key}`;
    if (seen.has(identity)) {
      warn(debug, `Duplicate shared element key "${identity}" detected. Using the first match.`);
      continue;
    }

    seen.add(identity);
    definitions.push({
      id: createGhostFrameId("gfs"),
      key,
      group,
      name: `gf-${identity.replace(/[^a-z0-9_-]+/gi, "-")}`,
      source: "auto"
    });
  }

  return definitions;
}

export function buildSharedElementDefinitions(input: BuildDefinitionsInput): SharedElementDefinition[] {
  const definitions: SharedElementDefinition[] = [];

  if (input.options.autoSharedElements && input.root) {
    definitions.push(...collectAutoDefinitions(input.root, input.debug));
  }

  for (const entry of input.options.sharedElements ?? []) {
    if (typeof entry === "string") {
      definitions.push({
        id: createGhostFrameId("gfs"),
        key: entry,
        name: `gf-${entry.replace(/[^a-z0-9_-]+/gi, "-")}`,
        source: "manual"
      });
      continue;
    }

    definitions.push({
      id: createGhostFrameId("gfs"),
      key: entry.key,
      group: entry.group,
      from: entry.from,
      to: entry.to,
      name: entry.name ?? (entry.key ? `gf-${entry.key.replace(/[^a-z0-9_-]+/gi, "-")}` : undefined),
      source: "manual"
    });
  }

  return definitions;
}

function resolveDefinitionElement(
  definition: SharedElementDefinition,
  root: ParentNode | null,
  registry: SharedElementRegistry,
  phase: "from" | "to"
): Element | null {
  if (!root) {
    return null;
  }

  const explicitTarget = phase === "from" ? definition.from : definition.to;
  const explicitElement = resolveElementTarget(explicitTarget, root);
  if (explicitElement) {
    return explicitElement;
  }

  if (definition.key) {
    const selector = buildSharedElementSelector(definition.key, definition.group);
    const element = root.querySelector(selector);
    if (element) {
      return element;
    }

    const resolver = registry.get(definition.key);
    if (resolver) {
      return resolver() ?? null;
    }
  }

  return null;
}

export function captureSharedElementPhase(input: {
  definitions: SharedElementDefinition[];
  root: ParentNode | null;
  registry: SharedElementRegistry;
  phase: "from" | "to";
}): SharedElementCapture[] {
  return input.definitions.map((definition) => ({
    definition,
    element: resolveDefinitionElement(definition, input.root, input.registry, input.phase)
  }));
}

export function matchSharedElementCaptures(
  before: SharedElementCapture[],
  after: SharedElementCapture[]
): SharedElementMatch[] {
  const afterMap = new Map(after.map((entry) => [entry.definition.id, entry]));

  return before.map((entry) => {
    const next = afterMap.get(entry.definition.id);
    return {
      id: entry.definition.id,
      key: entry.definition.key ?? entry.definition.id,
      group: entry.definition.group,
      from: entry.element,
      to: next?.element ?? null,
      name: entry.definition.name ?? `gf-${entry.definition.id}`
    };
  });
}

export function resolveSharedElementMatches(input: {
  fromRoot: ParentNode | null;
  toRoot: ParentNode | null;
  options: Pick<GhostFrameTransitionOptions, "autoSharedElements" | "sharedElements">;
  registry?: SharedElementRegistry;
  debug?: boolean;
}): SharedElementMatch[] {
  const registry = input.registry ?? new Map();
  const definitions = buildSharedElementDefinitions({
    root: input.fromRoot,
    options: input.options,
    registry,
    debug: input.debug ?? false
  });
  const before = captureSharedElementPhase({
    definitions,
    root: input.fromRoot,
    registry,
    phase: "from"
  });
  const after = captureSharedElementPhase({
    definitions,
    root: input.toRoot,
    registry,
    phase: "to"
  });

  return matchSharedElementCaptures(before, after);
}

