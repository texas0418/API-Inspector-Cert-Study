import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { getEveryQuestion } from '../lib/bank';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function Bookmarks() {
  const { tokens } = useTheme();
  const bookmarks = useStore((s) => s.bookmarks);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const all = getEveryQuestion();
  const saved = all.filter((q) => bookmarks.includes(q.id));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: tokens.bg }} contentContainerStyle={{ padding: 16 }}>
      {saved.length === 0 && (
        <Text style={{ color: tokens.muted, textAlign: 'center', marginTop: 40 }}>
          No bookmarks yet. Tap “save” on a question during a session.
        </Text>
      )}
      {saved.map((q) => (
        <View
          key={q.id}
          style={{
            backgroundColor: tokens.panel,
            borderColor: tokens.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: tokens.muted, fontFamily: mono, fontSize: 11 }}>{q.subtopic}</Text>
            <Pressable onPress={() => toggleBookmark(q.id)}>
              <Text style={{ color: tokens.accent, fontFamily: mono, fontSize: 12 }}>★ remove</Text>
            </Pressable>
          </View>
          <Text style={{ color: tokens.ink, fontSize: 15, lineHeight: 22, marginVertical: 8 }}>
            {q.content.stem}
          </Text>
          <Text style={{ color: tokens.good, fontSize: 14 }}>
            {LETTERS[q.content.answer]}. {q.content.options[q.content.answer]}
          </Text>
          <Text style={{ color: tokens.ink, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
            {q.content.explanation}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
