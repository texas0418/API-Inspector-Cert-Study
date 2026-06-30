import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../lib/useTheme';

export default function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  const { tokens } = useTheme();
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View
      style={{
        height: 7,
        borderRadius: 4,
        backgroundColor: tokens.panelAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: 4,
          backgroundColor: color ?? tokens.accent,
        }}
      />
    </View>
  );
}
