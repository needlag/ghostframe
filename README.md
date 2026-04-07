# GhostFrame

**Cinematic transitions for modern web apps.**

GhostFrame is a framework-agnostic JavaScript and TypeScript library for same-document UI transitions on the web. It prefers the native View Transition API when available, falls back to a FLIP + Web Animations overlay path when it is not, and gives shared-element transitions a clean, memorable API.

## Why GhostFrame exists

Modern interfaces often change state abruptly even when the underlying interaction is spatial and continuous. Cards expand into details. Thumbnails open into lightboxes. Panels swap inside dense dashboards. Native View Transitions help, but support varies and the raw API still leaves orchestration, matching, and cleanup to application code.

GhostFrame exists to make those transitions feel deliberate without turning motion into framework lock-in.

## Features

- Native-first transition execution with `document.startViewTransition(...)` when supported
- First-class fallback execution with FLIP measurements and Web Animations API
- Shared-element matching by `data-gf-key`
- Optional manual shared-element mapping for advanced cases
- Framework-agnostic core package
- Presets: `fade`, `slide`, `scale`, `morph`, `none`
- Reduced-motion aware planning
- Transition lifecycle hooks
- Queueing and overlap protection
- Debug-friendly feature detection and graceful warnings
- Polished demo app with list/detail, gallery/lightbox, and tabs/panels examples

## Quick start

```bash
pnpm install
pnpm build
pnpm test
pnpm dev
```

The demo runs from `apps/demo`.

## Install

```bash
pnpm add ghostframe
```

## Basic usage

```ts
import { createGhostFrame } from "ghostframe";

const gf = createGhostFrame({
  root: "#app",
  duration: 450,
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  preset: "morph"
});

await gf.transition(() => {
  renderNextView();
}, {
  autoSharedElements: true
});
```

## Shared-element examples

Manual selectors:

```ts
await gf.transition(() => {
  openDetails();
}, {
  preset: "morph",
  sharedElements: [
    { from: "[data-gf-key='card-1-image']", to: "[data-gf-key='detail-image']" },
    { from: "[data-gf-key='card-1-title']", to: "[data-gf-key='detail-title']" }
  ]
});
```

Automatic matching by key:

```ts
await gf.transition(() => {
  openDetails();
}, {
  preset: "morph",
  autoSharedElements: true
});
```

Attribute convention:

```html
<article data-gf-key="product-image-42"></article>
<h2 data-gf-key="product-title-42"></h2>
<div data-gf-group="catalog"></div>
<div data-gf-ignore></div>
```

Advanced manual registration:

```ts
const unregister = gf.registerSharedElement("hero-image", () =>
  document.querySelector("[data-active-hero]")
);
```

## API

### `createGhostFrame(options?)`

Creates a transition engine instance.

Key options:

- `root`: stable transition root element, selector, or resolver
- `duration`: default duration in milliseconds
- `easing`: default easing string
- `preset`: default preset
- `mode`: `"auto" | "native" | "fallback"`
- `autoSharedElements`: enable matching by `data-gf-key`
- `queueStrategy`: `"wait" | "skip" | "replace"`
- `reducedMotion`: `"auto" | "reduce" | "off"`
- `debug`: emit warnings and transition logs
- `onBeforeTransition`, `onAfterTransition`, `onError`

### `gf.transition(update, options?)`

Runs one same-document transition. `update` is the DOM or framework state commit. In React, the demo uses `flushSync` inside the callback so the DOM is committed within the transition boundary.

### `gf.registerSharedElement(key, resolver)`

Registers a resolver for advanced matching cases when selectors are awkward or ephemeral.

### `gf.cancelPending()` / `gf.skipCurrent()`

Provides coarse control over queued work. Native transitions cannot always be interrupted mid-flight, so skip behavior is best-effort by design.

## Native vs fallback behavior

GhostFrame plans each transition in three stages:

1. Planning resolves preset, mode, reduced-motion behavior, root, and shared-element definitions.
2. Native execution uses `document.startViewTransition(...)`, applies temporary `view-transition-name` values, and cleans them up after completion.
3. Fallback execution captures before/after boxes, clones elements into a fixed overlay, animates them with Web Animations, hides the destination while the clone is in flight, and removes all temporary artifacts after completion.

Native support varies by browser. The fallback path is a first-class part of the library, but fallback shared-element transitions are still approximations rather than true DOM snapshot morphs.

## Reduced motion

GhostFrame checks `prefers-reduced-motion` by default. In reduced-motion mode it shortens duration, collapses heavier presets to `fade`, and disables shared-element motion. You can override this with:

- `reducedMotion: "auto"`: follow system preference
- `reducedMotion: "reduce"`: force reduced motion
- `reducedMotion: "off"`: ignore system preference

## Demo

The demo includes:

- List to detail shared-element transition
- Gallery to lightbox transition
- Tabs and panel swap transition
- Live controls for preset, mode, easing, duration, and reduced-motion simulation

Run it with:

```bash
pnpm dev
```

## Architecture summary

Monorepo layout:

- `packages/ghostframe`: library package
- `apps/demo`: demo app

Core library layers:

- `planning`: preset resolution, mode selection, shared-element definitions
- `native`: View Transition execution and temporary CSS hooks
- `fallback`: overlay cloning, FLIP math, WAAPI animation, cleanup
- `core`: public API, queueing, feature detection, error handling

## Why not just use CSS transitions?

CSS transitions are useful, but they do not solve transition orchestration across UI states. GhostFrame adds:

- a single transition boundary for DOM updates
- shared-element matching
- progressive enhancement to native browser transitions
- fallback execution when native support is missing
- a cleaner API for cross-state motion instead of ad hoc CSS timing scattered across components

## Why not just rely on native View Transitions?

Native View Transitions are the best baseline, but they are not the whole product. GhostFrame adds:

- framework-neutral ergonomics
- shared-element conventions with `data-gf-key`
- manual registration for hard cases
- a preset system
- overlap protection and queueing
- robust cleanup
- a usable fallback path where native support is absent

## Limitations

- v1 is focused on same-document transitions
- only one transition should run at a time per document in this MVP
- browser support for native View Transitions varies
- fallback shared-element transitions are approximations
- exact morphing across unrelated DOM structures is intentionally out of scope
- cross-document or MPA transitions are optional future work, not the core of v1

## Roadmap

- Router integration examples for React, Vue, and vanilla apps
- Better per-element timing controls
- Cross-document guidance for supported browsers
- Improved fallback heuristics for complex nested layouts
- Devtools-style debug overlays

