import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';
import { restorePurchases, isLiveMode } from '../lib/purchases';

export default function Settings() {
  const { tokens } = useTheme();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const resetProgress = useStore((s) => s.resetProgress);

  const options: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];

  function confirmReset() {
    Alert.alert('Reset progress?', 'This clears study progress and history. Purchases are kept.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetProgress() },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12, marginBottom: 8 }}>
        APPEARANCE
      </Text>
      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        {options.map((o) => (
          <Pressable
            key={o}
            onPress={() => setTheme(o)}
            style={{
              flex: 1,
              marginRight: o !== 'dark' ? 8 : 0,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: theme === o ? tokens.accent : tokens.panel,
              borderColor: tokens.border,
              borderWidth: 1,
            }}
          >
            <Text
              style={{
                color: theme === o ? tokens.accentInk : tokens.ink,
                fontFamily: mono,
                fontSize: 13,
              }}
            >
              {o}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12, marginBottom: 8 }}>
        PURCHASES
      </Text>
      <Pressable
        onPress={() => restorePurchases().then(() => Alert.alert('Restore', 'Restore attempted.'))}
        style={{
          padding: 14,
          borderRadius: 10,
          borderColor: tokens.border,
          borderWidth: 1,
          backgroundColor: tokens.panel,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: tokens.ink }}>Restore Purchases</Text>
      </Pressable>

      <Pressable
        onPress={confirmReset}
        style={{
          padding: 14,
          borderRadius: 10,
          borderColor: tokens.border,
          borderWidth: 1,
          backgroundColor: tokens.panel,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: tokens.bad }}>Reset progress</Text>
      </Pressable>

      <Text style={{ color: tokens.muted, fontSize: 12, lineHeight: 18 }}>
        {isLiveMode() ? '' : 'Preview mode: purchases are simulated locally.\n\n'}
        Independent study aid. Not affiliated with or endorsed by API. ASME, API, and
        related marks belong to their respective owners.
      </Text>
    </ScrollView>
  );
}
