export interface DOMRectLike {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export function readRect(element: Element): DOMRectLike {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    right: rect.right,
    bottom: rect.bottom
  };
}

