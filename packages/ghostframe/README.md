# GhostFrame

Cinematic transitions for modern web apps.

GhostFrame is a framework-agnostic page and state transition engine that prefers the native View Transition API when available and falls back to a FLIP + Web Animations overlay path when it is not.

```ts
import { createGhostFrame } from "ghostframe";

const gf = createGhostFrame({
  root: "#app",
  preset: "morph",
  duration: 450
});

await gf.transition(() => {
  renderNextView();
}, {
  autoSharedElements: true
});
```
