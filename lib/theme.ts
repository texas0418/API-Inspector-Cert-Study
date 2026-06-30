// lib/theme.ts — token-based light/dark theme. Amber "instrument" identity,
// with a per-module accent hue so the shelf reads like labeled gauges.

export interface ThemeTokens {
  bg: string;
  bgAccent: string;   // subtle tint behind the header plate
  panel: string;
  panelAlt: string;
  ink: string;
  muted: string;
  border: string;
  accent: string;
  accentInk: string;
  accentSoft: string; // translucent amber for chip/badge fills
  accentAlt: string;  // cool secondary, used sparingly
  good: string;
  bad: string;
  shadow: string;
}

export const light: ThemeTokens = {
  bg: '#F3F5F8',
  bgAccent: '#ECEFF4',
  panel: '#FFFFFF',
  panelAlt: '#E9EDF3',
  ink: '#13171D',
  muted: '#586273',
  border: '#DBE1EA',
  accent: '#D9912B',
  accentInk: '#3A2A0A',
  accentSoft: '#D9912B1F',
  accentAlt: '#1F8FA6',
  good: '#1E8E5A',
  bad: '#C4453B',
  shadow: '#1B2433',
};

export const dark: ThemeTokens = {
  bg: '#0B0E14',
  bgAccent: '#11161F',
  panel: '#141A23',
  panelAlt: '#1E2630',
  ink: '#ECF1F7',
  muted: '#8A94A4',
  border: '#2A333F',
  accent: '#F2A93B',
  accentInk: '#1A1305',
  accentSoft: '#F2A93B26',
  accentAlt: '#54C7D4',
  good: '#46C28A',
  bad: '#E0685E',
  shadow: '#000000',
};

// Per-module accent hue. Gives each module card a recognizable color tab.
export const MODULE_HUES: Record<string, string> = {
  '510': '#F2A93B', // amber — base/hero
  '570': '#E0794A', // copper
  '653': '#3FAE9A', // teal
};

export function moduleAccent(code: string, fallback: string): string {
  return MODULE_HUES[code] ?? fallback;
}

// Append an alpha byte to a #RRGGBB hex (RN supports #RRGGBBAA).
export function withAlpha(hex: string, alpha = '26'): string {
  return hex.length === 7 ? hex + alpha : hex;
}

// Monospace stack for the "instrument" labels.
export const mono =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Roboto Mono", monospace';

export function tokensFor(scheme: 'light' | 'dark'): ThemeTokens {
  return scheme === 'dark' ? dark : light;
}
