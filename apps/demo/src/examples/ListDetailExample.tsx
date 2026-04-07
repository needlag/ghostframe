import type { FeatureCard } from "../data";

interface ListDetailExampleProps {
  cards: FeatureCard[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export function ListDetailExample(props: ListDetailExampleProps) {
  const activeCard = props.cards.find((card) => card.id === props.activeId) ?? null;

  return (
    <section className="example-panel">
      <div className="example-head">
        <div>
          <p className="eyebrow">List to detail</p>
          <h2>Shared elements carry the narrative.</h2>
        </div>
        <p className="example-copy">
          Card shell, image field, and title all reuse the same `data-gf-key` values so the transition feels spatial instead of decorative.
        </p>
      </div>

      <div className={`feature-layout ${activeCard ? "feature-layout--detail" : ""}`}>
        <div className="feature-grid">
          {props.cards.map((card) => {
            const hidden = activeCard?.id === card.id;
            return (
              <button
                key={card.id}
                type="button"
                className={`feature-card ${hidden ? "feature-card--ghosted" : ""}`}
                onClick={() => props.onOpen(card.id)}
                data-gf-key={`${card.id}-shell`}
                data-gf-group="catalog"
                data-gf-ignore={hidden ? "" : undefined}
              >
                <div
                  className="feature-card__media"
                  style={{ background: card.palette }}
                  data-gf-key={`${card.id}-image`}
                  data-gf-group="catalog"
                  data-gf-ignore={hidden ? "" : undefined}
                />
                <div className="feature-card__meta">
                  <span>{card.kicker}</span>
                  <span>{card.year}</span>
                </div>
                <h3
                  className="feature-card__title"
                  data-gf-key={`${card.id}-title`}
                  data-gf-group="catalog"
                  data-gf-ignore={hidden ? "" : undefined}
                >
                  {card.title}
                </h3>
                <p>{card.description}</p>
              </button>
            );
          })}
        </div>

        {activeCard ? (
          <article className="feature-detail" data-gf-key={`${activeCard.id}-shell`} data-gf-group="catalog">
            <div
              className="feature-detail__media"
              style={{ background: activeCard.palette }}
              data-gf-key={`${activeCard.id}-image`}
              data-gf-group="catalog"
            />
            <div className="feature-detail__body">
              <div className="feature-detail__meta">
                <span>{activeCard.kicker}</span>
                <span>{activeCard.year}</span>
              </div>
              <h3 data-gf-key={`${activeCard.id}-title`} data-gf-group="catalog">
                {activeCard.title}
              </h3>
              <p>{activeCard.description}</p>
              <p>
                GhostFrame treats this as a same-document state change. The library resolves a plan, applies native view-transition names when possible,
                and falls back to measured overlays when it cannot.
              </p>
              <button type="button" className="secondary-button" onClick={props.onClose}>
                Return to grid
              </button>
            </div>
          </article>
        ) : (
          <div className="feature-detail feature-detail--placeholder">
            <p>Select a card to expand it into a richer detail view.</p>
          </div>
        )}
      </div>
    </section>
  );
}

