import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';

export default function History() {
  const { tokens } = useTheme();
  const history = useStore((s) => s.history);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      {history.length === 0 && (
        <Text style={{ color: tokens.muted, textAlign: 'center', marginTop: 40 }}>
          No sessions yet.
        </Text>
      )}
      {history.map((h) => {
        const pct = Math.round((100 * h.correct) / Math.max(1, h.total));
        const d = new Date(h.at);
        return (
          <View
            key={h.id}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: tokens.panel,
              borderColor: tokens.border,
              borderWidth: 1,
              borderRadius: 10,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <View>
              <Text style={{ color: tokens.ink, fontFamily: mono }}>
                API {h.exam} · {h.mode}
              </Text>
              <Text style={{ color: tokens.muted, fontSize: 12, marginTop: 2 }}>
                {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={{ color: tokens.accent, fontFamily: mono, fontSize: 16 }}>
              {pct}%
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
