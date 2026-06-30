import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';
import type { ModuleDef } from '../lib/types';
import { priceForModule, purchaseModule, restorePurchases, isLiveMode } from '../lib/purchases';

interface Props {
  module: ModuleDef;
  onUnlocked: () => void;
}

export default function Paywall({ module, onUnlocked }: Props) {
  const { tokens } = useTheme();
  const [price, setPrice] = useState('$9.99');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let on = true;
    priceForModule(module.id).then((p) => on && setPrice(p));
    return () => {
      on = false;
    };
  }, [module.id]);

  async function buy() {
    setBusy(true);
    const ok = await purchaseModule(module.id);
    setBusy(false);
    if (ok) onUnlocked();
  }

  async function restore() {
    setBusy(true);
    await restorePurchases();
    setBusy(false);
    onUnlocked();
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View
        style={{
          backgroundColor: tokens.panel,
          borderColor: tokens.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 22,
        }}
      >
        <Text style={{ fontFamily: mono, fontSize: 13, color: tokens.muted }}>UNLOCK</Text>
        <Text style={{ fontSize: 22, color: tokens.ink, fontWeight: '700', marginTop: 6 }}>
          {module.title} — {module.subtitle}
        </Text>
        <Text style={{ color: tokens.muted, marginTop: 12, lineHeight: 20 }}>
          Full question bank with practice and timed-exam modes, weak-first review,
          progress tracking, and bookmarks. One-time purchase, yours to keep.
        </Text>

        <Pressable
          onPress={buy}
          disabled={busy}
          style={{
            marginTop: 20,
            backgroundColor: tokens.accent,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          {busy ? (
            <ActivityIndicator color={tokens.accentInk} />
          ) : (
            <Text style={{ color: tokens.accentInk, fontWeight: '700', fontSize: 16 }}>
              Unlock for {price}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={restore} disabled={busy} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 13 }}>
            Restore Purchases
          </Text>
        </Pressable>

        {!isLiveMode() && (
          <Text style={{ color: tokens.muted, fontSize: 11, marginTop: 16, textAlign: 'center' }}>
            (Preview mode — purchases are simulated locally.)
          </Text>
        )}
      </View>

      <Text style={{ color: tokens.muted, fontSize: 11, marginTop: 18, textAlign: 'center', lineHeight: 16 }}>
        Independent study aid. Not affiliated with or endorsed by API.
      </Text>
    </ScrollView>
  );
}
