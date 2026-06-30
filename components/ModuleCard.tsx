import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../lib/useTheme';
import { mono, moduleAccent, withAlpha } from '../lib/theme';
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
  const hue = moduleAccent(module.id, tokens.accent);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: locked ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        backgroundColor: tokens.panel,
        borderColor: tokens.border,
        borderWidth: 1,
        borderRadius: 16,
        marginBottom: 14,
        overflow: 'hidden',
        flexDirection: 'row',
        // subtle elevation
        shadowColor: tokens.shadow,
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      })}
    >
      {/* left accent stripe */}
      <View style={{ width: 5, backgroundColor: hue }} />

      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* code badge */}
          <View
            style={{
              backgroundColor: withAlpha(hue, '22'),
              borderRadius: 7,
              paddingHorizontal: 9,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontFamily: mono, fontSize: 13, color: hue, letterSpacing: 1 }}>
              {module.title.replace(/^API\s*/, 'API ')}
            </Text>
          </View>

          {/* status pill */}
          {locked ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: tokens.panelAlt,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontFamily: mono, fontSize: 11, color: tokens.muted, letterSpacing: 1 }}>
                LOCKED
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: withAlpha(hue, '22'),
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontFamily: mono, fontSize: 11, color: hue, letterSpacing: 0.5 }}>
                {readiness}% READY
              </Text>
            </View>
          )}
        </View>

        <Text style={{ color: tokens.ink, marginTop: 12, fontSize: 17, fontWeight: '600' }}>
          {module.subtitle}
        </Text>

        <Text style={{ color: tokens.muted, marginTop: 6, fontSize: 12, fontFamily: mono, letterSpacing: 0.3 }}>
          {count} {count === 1 ? 'QUESTION' : 'QUESTIONS'}
        </Text>

        {!locked && (
          <View style={{ marginTop: 12 }}>
            <ProgressBar pct={readiness} color={hue} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
