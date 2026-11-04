// Tailwind CSS v3 preset of the Hospitrend tokens (Tailwind v4: use tailwind-theme.css).
// tailwind.config: presets: [require('./design/tailwind.preset.cjs')]
// and import design/tokens.css in the global stylesheet.
const v = (name) => `var(--ht-${name})`;

module.exports = {
  darkMode: ['variant', ['@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) & }', '[data-theme="dark"] &']],
  theme: {
    extend: {
      fontFamily: { sans: [v('font-sans')] },
      colors: {
        bg: v('color-bg'),
        surface: { DEFAULT: v('color-surface'), muted: v('color-surface-muted') },
        border: { DEFAULT: v('color-border'), strong: v('color-border-strong') },
        text: v('color-text'),
        body: v('color-text-body'),
        muted: v('color-text-muted'),
        primary: { DEFAULT: v('color-primary'), fg: v('color-on-primary') },
        accent: { DEFAULT: v('color-accent'), fg: v('color-on-accent'), text: v('color-accent-text') },
        idea: { bg: v('color-idea-bg'), fg: v('color-idea-fg') },
        danger: v('color-danger'),
        nav: { DEFAULT: v('color-nav-bg'), fg: v('color-nav-fg'), active: v('color-nav-active-bg'), 'active-fg': v('color-nav-active-fg') },
        placeholder: v('color-placeholder'),
        topic: { DEFAULT: v('topic-bg'), fg: v('topic-fg') },
      },
      borderRadius: {
        sm: v('radius-sm'), md: v('radius-md'), lg: v('radius-lg'), xl: v('radius-xl'), card: v('radius-card'), pill: v('radius-pill'),
      },
      boxShadow: { card: v('shadow-card') },
      spacing: {
        touch: v('size-touch-min'), button: v('size-button'), 'button-lg': v('size-button-lg'),
        'action-main': v('size-action-main'), 'action-side': v('size-action-side'), nav: v('size-nav'),
      },
    },
  },
};
