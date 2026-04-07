export interface FeatureCard {
  id: string;
  title: string;
  kicker: string;
  year: string;
  description: string;
  palette: string;
}

export const featureCards: FeatureCard[] = [
  {
    id: "astral",
    title: "Astral Index",
    kicker: "Neo-noir dossier",
    year: "2048",
    description: "A city-scale investigation interface with layered cards, deep metadata, and cinematic reveal motion.",
    palette: "linear-gradient(135deg, rgba(86,117,255,0.8), rgba(18,24,38,0.95))"
  },
  {
    id: "raven",
    title: "Raven Divide",
    kicker: "Coastal surveillance",
    year: "2039",
    description: "A compact intelligence view that turns dense state changes into legible, polished movement.",
    palette: "linear-gradient(135deg, rgba(28,140,122,0.85), rgba(15,20,28,0.95))"
  },
  {
    id: "sable",
    title: "Sable Transit",
    kicker: "Mobility operations",
    year: "2051",
    description: "An orchestration dashboard balancing clarity, hierarchy, and soft transitions between nested views.",
    palette: "linear-gradient(135deg, rgba(245,155,78,0.85), rgba(32,20,14,0.96))"
  }
];

export const galleryShots = [
  {
    id: "frame-01",
    title: "Neon Corridor",
    tone: "Night architecture",
    palette: "linear-gradient(135deg, rgba(48,82,181,0.85), rgba(11,13,25,0.98))"
  },
  {
    id: "frame-02",
    title: "Signal Chamber",
    tone: "Instrument detail",
    palette: "linear-gradient(135deg, rgba(9,116,103,0.9), rgba(10,12,22,0.96))"
  },
  {
    id: "frame-03",
    title: "Solar Deck",
    tone: "Warm industrial",
    palette: "linear-gradient(135deg, rgba(201,119,39,0.9), rgba(26,14,10,0.97))"
  },
  {
    id: "frame-04",
    title: "Quiet Archive",
    tone: "Ambient workspace",
    palette: "linear-gradient(135deg, rgba(127,101,175,0.9), rgba(17,15,28,0.97))"
  }
];

export const tabs = [
  {
    id: "overview",
    label: "Overview",
    metric: "94%",
    title: "Calm dashboard transitions",
    body: "State changes should preserve continuity, not force the user to re-orient on every panel swap."
  },
  {
    id: "signals",
    label: "Signals",
    metric: "18 ms",
    title: "Fast fallback execution",
    body: "When native View Transitions are unavailable, GhostFrame drops to measured FLIP overlays and Web Animations."
  },
  {
    id: "handoff",
    label: "Handoff",
    metric: "1 API",
    title: "Framework-neutral integration",
    body: "A single transition call works with vanilla DOM, React, or any renderer that can commit a DOM update."
  }
];

