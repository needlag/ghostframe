const STYLE_ID = "ghostframe-native-styles";

const STYLES = `
@keyframes gf-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes gf-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes gf-slide-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0px); } }
@keyframes gf-slide-out { from { opacity: 1; transform: translateY(0px); } to { opacity: 0; transform: translateY(-18px); } }
@keyframes gf-scale-in { from { opacity: 0; transform: scale(0.985); } to { opacity: 1; transform: scale(1); } }
@keyframes gf-scale-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.015); } }
@keyframes gf-morph-in { from { opacity: 0; transform: translateY(10px) scale(0.99); } to { opacity: 1; transform: translateY(0px) scale(1); } }
@keyframes gf-morph-out { from { opacity: 1; transform: translateY(0px) scale(1); } to { opacity: 0; transform: translateY(-10px) scale(1.01); } }

html.gf-native::view-transition-group(*) {
  animation-duration: var(--gf-duration);
  animation-timing-function: var(--gf-easing);
}

html.gf-native::view-transition-old(root),
html.gf-native::view-transition-new(root) {
  animation-duration: var(--gf-duration);
  animation-fill-mode: both;
  animation-timing-function: var(--gf-easing);
}

html.gf-native.gf-preset-fade::view-transition-old(root) { animation-name: gf-fade-out; }
html.gf-native.gf-preset-fade::view-transition-new(root) { animation-name: gf-fade-in; }
html.gf-native.gf-preset-slide::view-transition-old(root) { animation-name: gf-slide-out; }
html.gf-native.gf-preset-slide::view-transition-new(root) { animation-name: gf-slide-in; }
html.gf-native.gf-preset-scale::view-transition-old(root) { animation-name: gf-scale-out; }
html.gf-native.gf-preset-scale::view-transition-new(root) { animation-name: gf-scale-in; }
html.gf-native.gf-preset-morph::view-transition-old(root) { animation-name: gf-morph-out; }
html.gf-native.gf-preset-morph::view-transition-new(root) { animation-name: gf-morph-in; }
html.gf-native.gf-preset-none::view-transition-old(root),
html.gf-native.gf-preset-none::view-transition-new(root) { animation: none; }
`;

export function ensureNativeStyles(doc: Document): void {
  if (doc.getElementById(STYLE_ID)) {
    return;
  }

  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLES;
  doc.head.appendChild(style);
}

