import type { SharedElementTarget } from "../types/public";

function escapeAttributeValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function resolveElementTarget(
  target: SharedElementTarget,
  root: ParentNode | Document = document
): Element | null {
  if (!target) {
    return null;
  }

  if (typeof target === "string") {
    return root.querySelector(target);
  }

  if (typeof target === "function") {
    return target() ?? null;
  }

  return target;
}

export function resolveRootElement(target?: SharedElementTarget, doc?: Document): Element | null {
  const activeDocument = doc ?? (typeof document !== "undefined" ? document : undefined);
  if (!activeDocument) {
    return null;
  }

  if (!target) {
    return activeDocument.body;
  }

  return resolveElementTarget(target, activeDocument);
}

export function buildSharedElementSelector(key: string, group?: string): string {
  const keySelector = `[data-gf-key="${escapeAttributeValue(key)}"]`;
  if (!group) {
    return `${keySelector}:not([data-gf-ignore])`;
  }

  return `${keySelector}[data-gf-group="${escapeAttributeValue(group)}"]:not([data-gf-ignore])`;
}

