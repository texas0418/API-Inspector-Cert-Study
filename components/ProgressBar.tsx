import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../lib/useTheme';

export default function ProgressBar({ pct }: { pct: number }) {
  const { tokens } = useTheme();
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: tokens.panelAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          backgroundColor: tokens.accent,
        }}
      />
    </View>
  );
}
