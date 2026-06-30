import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';
import ProgressBar from './ProgressBar';
import type { ModuleDef } from '../lib/types';

interface Props {
  module: ModuleDef;
  count: number;
  locked: boolean;
  readiness: number;
  onPress: () => void;
}

export default function ModuleCard({ module, count, locked, readiness, onPress }: Props) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        opacity: locked ? 0.55 : 1,
        backgroundColor: tokens.panel,
        borderColor: tokens.border,
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: mono, fontSize: 16, color: tokens.ink, letterSpacing: 0.5 }}>
          {module.title}
        </Text>
        {locked ? (
          <Text style={{ fontFamily: mono, fontSize: 12, color: tokens.muted }}>🔒 LOCKED</Text>
        ) : (
          <Text style={{ fontFamily: mono, fontSize: 12, color: tokens.accent }}>
            {readiness}% READY
          </Text>
        )}
      </View>
      <Text style={{ color: tokens.muted, marginTop: 4, fontSize: 13 }}>{module.subtitle}</Text>
      <Text style={{ color: tokens.muted, marginTop: 8, fontSize: 12, fontFamily: mono }}>
        {count} questions
      </Text>
      {!locked && (
        <View style={{ marginTop: 10 }}>
          <ProgressBar pct={readiness} />
        </View>
      )}
    </Pressable>
  );
}
