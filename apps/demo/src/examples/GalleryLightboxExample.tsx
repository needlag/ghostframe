import type { galleryShots } from "../data";

type Shot = (typeof galleryShots)[number];

interface GalleryLightboxExampleProps {
  shots: Shot[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export function GalleryLightboxExample(props: GalleryLightboxExampleProps) {
  const active = props.shots.find((shot) => shot.id === props.activeId) ?? null;

  return (
    <section className="example-panel">
      <div className="example-head">
        <div>
          <p className="eyebrow">Gallery to lightbox</p>
          <h2>Thumbnail to modal without losing continuity.</h2>
        </div>
        <p className="example-copy">
          This example leans on shared image and label keys. In fallback mode the illusion is clone-based, so the target stays hidden until cleanup.
        </p>
      </div>

      <div className="gallery-grid">
        {props.shots.map((shot) => {
          const hidden = active?.id === shot.id;
          return (
            <button
              key={shot.id}
              type="button"
              className={`gallery-shot ${hidden ? "gallery-shot--ghosted" : ""}`}
              onClick={() => props.onOpen(shot.id)}
            >
              <div
                className="gallery-shot__image"
                style={{ background: shot.palette }}
                data-gf-key={`${shot.id}-image`}
                data-gf-ignore={hidden ? "" : undefined}
              />
              <div className="gallery-shot__row">
                <strong data-gf-key={`${shot.id}-title`} data-gf-ignore={hidden ? "" : undefined}>
                  {shot.title}
                </strong>
                <span>{shot.tone}</span>
              </div>
            </button>
          );
        })}
      </div>

      {active ? (
        <div className="lightbox-shell">
          <div className="lightbox-backdrop" />
          <article className="lightbox-card">
            <div className="lightbox-card__image" style={{ background: active.palette }} data-gf-key={`${active.id}-image`} />
            <div className="lightbox-card__body">
              <div className="lightbox-card__head">
                <div>
                  <p className="eyebrow">Expanded frame</p>
                  <h3 data-gf-key={`${active.id}-title`}>{active.title}</h3>
                </div>
                <button type="button" className="secondary-button" onClick={props.onClose}>
                  Close
                </button>
              </div>
              <p>
                Shared-element transitions are approximations in fallback mode, but the motion still keeps image scale, position, and context aligned.
              </p>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

