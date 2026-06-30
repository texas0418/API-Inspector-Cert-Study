// lib/useTheme.ts — resolve active theme tokens from the user's preference and
// the OS color scheme.

import { useColorScheme } from 'react-native';
import { useStore } from './store';
import { tokensFor, type ThemeTokens } from './theme';

export function useTheme(): { tokens: ThemeTokens; scheme: 'light' | 'dark' } {
  const pref = useStore((s) => s.theme);
  const system = useColorScheme();
  const scheme: 'light' | 'dark' =
    pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;
  return { tokens: tokensFor(scheme), scheme };
}
