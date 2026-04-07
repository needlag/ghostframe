import type { DOMRectLike } from "./domRects";

function applyAbsoluteBoxStyle(element: HTMLElement, rect: DOMRectLike): void {
  element.style.position = "fixed";
  element.style.top = `${rect.top}px`;
  element.style.left = `${rect.left}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
  element.style.margin = "0";
  element.style.transformOrigin = "top left";
  element.style.pointerEvents = "none";
  element.style.boxSizing = "border-box";
}

export function createOverlayRoot(doc: Document): HTMLDivElement {
  const overlay = doc.createElement("div");
  overlay.dataset.gfOverlay = "true";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.overflow = "hidden";
  overlay.style.zIndex = "2147483646";
  doc.body.appendChild(overlay);
  return overlay;
}

export function cloneIntoOverlay(
  overlay: HTMLElement,
  source: Element,
  rect: DOMRectLike
): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  applyAbsoluteBoxStyle(clone, rect);
  overlay.appendChild(clone);
  return clone;
}

