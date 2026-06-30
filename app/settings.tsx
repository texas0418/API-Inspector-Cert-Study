import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useStore, blockReadiness } from '../lib/store';
import { getEveryQuestion } from '../lib/bank';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';
import { restorePurchases, isLiveMode } from '../lib/purchases';

export default function Settings() {
  const { tokens } = useTheme();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const progress = useStore((s) => s.progress);
  const bookmarks = useStore((s) => s.bookmarks);
  const history = useStore((s) => s.history);
  const resetProgress = useStore((s) => s.resetProgress);
  const resetEverything = useStore((s) => s.resetEverything);

  const options: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];

  const allIds = getEveryQuestion().map((q) => q.id);
  const overallReady = blockReadiness(progress, allIds);
  const seen = allIds.filter((id) => (progress[id]?.seen ?? 0) > 0).length;
  const examsTaken = history.filter((h) => h.mode === 'exam').length;

  function confirmResetStudy() {
    Alert.alert(
      'Reset study & exams?',
      'Clears question progress, readiness, and exam history. Saved questions and purchases are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetProgress() },
      ]
    );
  }

  function confirmResetEverything() {
    Alert.alert(
      'Reset everything?',
      'Clears all progress, exam history, saved questions, test dates, and appearance. Purchases are kept (use Restore Purchases if needed).',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset everything', style: 'destructive', onPress: () => resetEverything() },
      ]
    );
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
            <Text style={{ color: theme === o ? tokens.accentInk : tokens.ink, fontFamily: mono, fontSize: 13 }}>
              {o}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12, marginBottom: 8 }}>
        YOUR DATA
      </Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Stat label="OVERALL READY" value={`${overallReady}%`} tokens={tokens} />
        <Stat label="SEEN" value={`${seen}/${allIds.length}`} tokens={tokens} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
        <Stat label="SAVED" value={String(bookmarks.length)} tokens={tokens} />
        <Stat label="EXAMS TAKEN" value={String(examsTaken)} tokens={tokens} />
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
          marginBottom: 24,
        }}
      >
        <Text style={{ color: tokens.ink }}>Restore Purchases</Text>
      </Pressable>

      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12, marginBottom: 8 }}>
        DATA
      </Text>
      <Pressable
        onPress={confirmResetStudy}
        style={{
          padding: 14,
          borderRadius: 10,
          borderColor: tokens.border,
          borderWidth: 1,
          backgroundColor: tokens.panel,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: tokens.ink, fontWeight: '600' }}>Reset Study & Exams</Text>
        <Text style={{ color: tokens.muted, fontSize: 12, marginTop: 4 }}>
          Clears progress and exam history. Keeps saved questions and purchases.
        </Text>
      </Pressable>
      <Pressable
        onPress={confirmResetEverything}
        style={{
          padding: 14,
          borderRadius: 10,
          borderColor: tokens.bad,
          borderWidth: 1,
          backgroundColor: tokens.panel,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: tokens.bad, fontWeight: '600' }}>Reset Everything</Text>
        <Text style={{ color: tokens.muted, fontSize: 12, marginTop: 4 }}>
          Clears all progress, exams, saved questions, test dates, and appearance. Purchases are kept.
        </Text>
      </Pressable>

      <Text style={{ color: tokens.muted, fontSize: 12, lineHeight: 18 }}>
        {isLiveMode() ? '' : 'Preview mode: purchases are simulated locally.\n\n'}
        Independent study aid for the API Individual Certification Program. Not affiliated with,
        authorized, or endorsed by the American Petroleum Institute (API) or ASME. API, ASME, and
        related marks belong to their respective owners.
      </Text>
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  tokens,
}: {
  label: string;
  value: string;
  tokens: ReturnType<typeof useTheme>['tokens'];
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tokens.panel,
        borderColor: tokens.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 10, letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ color: tokens.ink, fontSize: 20, fontWeight: '700', marginTop: 6 }}>{value}</Text>
    </View>
  );
}
