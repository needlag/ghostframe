import type { tabs } from "../data";

type Tab = (typeof tabs)[number];

interface TabsExampleProps {
  items: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function TabsExample(props: TabsExampleProps) {
  const active = props.items.find((item) => item.id === props.activeId) ?? props.items[0];

  return (
    <section className="example-panel">
      <div className="example-head">
        <div>
          <p className="eyebrow">Tabs and panels</p>
          <h2>Softer motion for dense interfaces.</h2>
        </div>
        <p className="example-copy">
          Not every transition needs a big morph. Tabs benefit from quieter continuity: panel shell, metric capsule, and title all move together.
        </p>
      </div>

      <div className="tabs-shell">
        <div className="tabs-row" role="tablist" aria-label="GhostFrame examples">
          {props.items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className={`tab-trigger ${active.id === item.id ? "is-active" : ""}`}
              aria-selected={active.id === item.id}
              onClick={() => props.onSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <article className="tab-panel" data-gf-key="tab-shell">
          <div className="tab-panel__metric" data-gf-key="tab-metric">
            {active.metric}
          </div>
          <div className="tab-panel__body">
            <p className="eyebrow">Current view</p>
            <h3 data-gf-key="tab-title">{active.title}</h3>
            <p>{active.body}</p>
          </div>
        </article>
      </div>
    </section>
  );
}

