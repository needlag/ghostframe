import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  createGhostFrame,
  type GhostFrame,
  type GhostFrameMode,
  type GhostFramePreset,
  type GhostFrameReducedMotion,
  type GhostFrameTransitionOptions,
  type GhostFrameTransitionResult
} from "ghostframe";
import { featureCards, galleryShots, tabs } from "./data";
import { GalleryLightboxExample } from "./examples/GalleryLightboxExample";
import { ListDetailExample } from "./examples/ListDetailExample";
import { TabsExample } from "./examples/TabsExample";

const presetOptions: GhostFramePreset[] = ["morph", "fade", "slide", "scale", "none"];
const modeOptions: GhostFrameMode[] = ["auto", "native", "fallback"];
const reducedMotionOptions: GhostFrameReducedMotion[] = ["auto", "reduce", "off"];
const easingOptions = [
  "cubic-bezier(0.2, 0.8, 0.2, 1)",
  "cubic-bezier(0.16, 1, 0.3, 1)",
  "cubic-bezier(0.32, 0.72, 0, 1)"
];

function formatResult(result: GhostFrameTransitionResult | null): string {
  if (!result) {
    return "No transition yet";
  }

  return `${result.mode} · ${result.preset} · ${result.status} · ${result.sharedElements} shared`;
}

export function App() {
  const ghostFrameRef = useRef<GhostFrame | null>(null);
  if (!ghostFrameRef.current) {
    ghostFrameRef.current = createGhostFrame({
      root: "#demo-stage",
      debug: true
    });
  }

  const ghostFrame = ghostFrameRef.current;
  const features = ghostFrame.getFeatures();
  const [mode, setMode] = useState<GhostFrameMode>("auto");
  const [preset, setPreset] = useState<GhostFramePreset>("morph");
  const [reducedMotion, setReducedMotion] = useState<GhostFrameReducedMotion>("auto");
  const [duration, setDuration] = useState(520);
  const [easing, setEasing] = useState(easingOptions[0]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [activeShot, setActiveShot] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastResult, setLastResult] = useState<GhostFrameTransitionResult | null>(null);

  async function runTransition(update: () => void, overrides: Partial<GhostFrameTransitionOptions> = {}) {
    const result = await ghostFrame.transition(
      () =>
        flushSync(() => {
          update();
        }),
      {
        mode,
        preset,
        duration,
        easing,
        reducedMotion,
        autoSharedElements: true,
        queueStrategy: "replace",
        ...overrides
      }
    );

    setLastResult(result);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">GhostFrame</p>
          <h1>Cinematic transitions for modern web apps.</h1>
          <p className="hero__lede">
            Native-first same-document transitions, shared-element matching, and a fallback path that still feels intentional when View Transitions are unavailable.
          </p>
        </div>

        <aside className="control-card">
          <div className="control-card__head">
            <div>
              <p className="eyebrow">Demo controls</p>
              <h2>Switch strategies live.</h2>
            </div>
            <span className="status-pill">{formatResult(lastResult)}</span>
          </div>

          <div className="control-grid">
            <label>
              <span>Mode</span>
              <select value={mode} onChange={(event) => setMode(event.target.value as GhostFrameMode)}>
                {modeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Preset</span>
              <select value={preset} onChange={(event) => setPreset(event.target.value as GhostFramePreset)}>
                {presetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Reduced motion</span>
              <select value={reducedMotion} onChange={(event) => setReducedMotion(event.target.value as GhostFrameReducedMotion)}>
                {reducedMotionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Easing</span>
              <select value={easing} onChange={(event) => setEasing(event.target.value)}>
                {easingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="range-control">
            <span>Duration: {duration}ms</span>
            <input type="range" min="120" max="900" step="10" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
          </label>

          <div className="feature-flags">
            <span className={features.supportsViewTransitions ? "is-on" : ""}>View Transitions {features.supportsViewTransitions ? "available" : "missing"}</span>
            <span className={features.supportsWebAnimations ? "is-on" : ""}>WAAPI {features.supportsWebAnimations ? "available" : "missing"}</span>
            <span className={features.prefersReducedMotion ? "is-on" : ""}>System reduced motion {features.prefersReducedMotion ? "on" : "off"}</span>
          </div>
        </aside>
      </header>

      <main id="demo-stage" className="demo-stage">
        <ListDetailExample
          cards={featureCards}
          activeId={selectedCard}
          onOpen={(id) => runTransition(() => setSelectedCard(id))}
          onClose={() => runTransition(() => setSelectedCard(null))}
        />

        <GalleryLightboxExample
          shots={galleryShots}
          activeId={activeShot}
          onOpen={(id) => runTransition(() => setActiveShot(id))}
          onClose={() => runTransition(() => setActiveShot(null))}
        />

        <TabsExample
          items={tabs}
          activeId={activeTab}
          onSelect={(id) => runTransition(() => setActiveTab(id), { autoSharedElements: true })}
        />
      </main>
    </div>
  );
}
