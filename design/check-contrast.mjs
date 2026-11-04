// Checks every color pair declared in tokens.json against WCAG 2.x AA.
// Usage: node design/check-contrast.mjs  (exits with code 1 on any failure)
import { readFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('./tokens.json', import.meta.url), 'utf8'));

const channel = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const rows = [];
for (const mode of ['light', 'dark']) {
  const c = tokens.color[mode];
  for (const [fg, bg] of tokens.contrastPairs.text) rows.push([mode, `${fg} / ${bg}`, c[fg], c[bg], 4.5]);
  for (const [fg, bg] of tokens.contrastPairs.ui) rows.push([mode, `${fg} / ${bg}`, c[fg], c[bg], 3]);
  for (const [name, t] of Object.entries(tokens.themeColor.tints[mode])) {
    rows.push([mode, `tint ${name} fg / bg`, t.fg, t.bg, 4.5]);
    rows.push([mode, `tint ${name} fg / surface`, t.fg, c.surface, 4.5]);
  }
}

let failures = 0;
for (const [mode, label, fg, bg, min] of rows) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= min;
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${mode.padEnd(5)} ${label.padEnd(32)} ${ratio.toFixed(2).padStart(5)}:1 (min ${min})`);
}
console.log(failures ? `\n${failures} pair(s) below AA` : `\nAll ${rows.length} pairs pass AA`);
process.exit(failures ? 1 : 0);
