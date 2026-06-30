// lib/theme.ts — token-based light/dark theme with an amber accent.

export interface ThemeTokens {
  bg: string;
  panel: string;
  panelAlt: string;
  ink: string;
  muted: string;
  border: string;
  accent: string;
  accentInk: string;
  good: string;
  bad: string;
}

export const light: ThemeTokens = {
  bg: '#F6F7F9',
  panel: '#FFFFFF',
  panelAlt: '#EEF1F4',
  ink: '#121417',
  muted: '#5C6470',
  border: '#D9DEE5',
  accent: '#E8A33D',
  accentInk: '#3A2A0A',
  good: '#1E8E5A',
  bad: '#C4453B',
};

export const dark: ThemeTokens = {
  bg: '#0E1116',
  panel: '#161B22',
  panelAlt: '#1F2630',
  ink: '#E8ECF1',
  muted: '#9AA4B2',
  border: '#2A323D',
  accent: '#E8A33D',
  accentInk: '#1A1305',
  good: '#3FB984',
  bad: '#E06A60',
};

// Monospace stack for the "instrument" labels.
export const mono =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Roboto Mono", monospace';

export function tokensFor(scheme: 'light' | 'dark'): ThemeTokens {
  return scheme === 'dark' ? dark : light;
}
