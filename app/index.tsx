import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore, blockReadiness } from '../lib/store';
import { MODULES, bankForExam } from '../lib/bank';
import { productIdForModule } from '../lib/bank';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';
import ModuleCard from '../components/ModuleCard';

export default function Home() {
  const router = useRouter();
  const { tokens } = useTheme();
  const unlocked = useStore((s) => s.unlocked);
  const progress = useStore((s) => s.progress);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 12, marginBottom: 12 }}>
        ICP EXAM PREP · TAP A MODULE
      </Text>

      {MODULES.map((m) => {
        const ids = bankForExam(m.id).map((q) => q.id);
        const locked = !unlocked.includes(productIdForModule(m.id));
        return (
          <ModuleCard
            key={m.id}
            module={m}
            count={ids.length}
            locked={locked}
            readiness={blockReadiness(progress, ids)}
            onPress={() => router.push(`/module/${m.id}`)}
          />
        );
      })}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
          marginBottom: 24,
        }}
      >
        <NavChip label="Bookmarks" onPress={() => router.push('/bookmarks')} />
        <NavChip label="History" onPress={() => router.push('/history')} />
        <NavChip label="Settings" onPress={() => router.push('/settings')} />
      </View>

      <Text style={{ color: tokens.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 }}>
        Independent study aid. Not affiliated with or endorsed by API.
      </Text>
    </ScrollView>
  );
}

function NavChip({ label, onPress }: { label: string; onPress: () => void }) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.panel,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: tokens.ink, fontFamily: mono, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}
