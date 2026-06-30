import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../lib/useTheme';
import { mono, withAlpha } from '../lib/theme';

interface Props {
  label: string;
  index: number;
  state: 'idle' | 'correct' | 'wrong' | 'reveal';
  disabled?: boolean;
  onPress: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function OptionButton({ label, index, state, disabled, onPress }: Props) {
  const { tokens } = useTheme();

  const answered = state === 'correct' || state === 'wrong' || state === 'reveal';
  const isCorrect = state === 'correct' || state === 'reveal';
  const isWrong = state === 'wrong';

  let border = tokens.border;
  let bg = tokens.panel;
  let borderWidth = 1;
  let badgeBg = tokens.panelAlt;
  let badgeText = tokens.muted;
  let glyph = LETTERS[index];
  let opacity = 1;

  if (isCorrect) {
    border = tokens.good;
    bg = withAlpha(tokens.good, '24');
    borderWidth = 2;
    badgeBg = tokens.good;
    badgeText = '#FFFFFF';
    glyph = '✓';
  } else if (isWrong) {
    border = tokens.bad;
    bg = withAlpha(tokens.bad, '24');
    borderWidth = 2;
    badgeBg = tokens.bad;
    badgeText = '#FFFFFF';
    glyph = '✕';
  } else if (state === 'idle' && disabled) {
    // an unchosen option after answering: dim so the result stands out
    opacity = 0.55;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        opacity,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth,
        borderColor: border,
        backgroundColor: bg,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          backgroundColor: badgeBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontFamily: mono, fontSize: 13, fontWeight: '700', color: badgeText }}>
          {glyph}
        </Text>
      </View>
      <Text
        style={{
          flex: 1,
          color: answered && (isCorrect || isWrong) ? tokens.ink : tokens.ink,
          fontSize: 15,
          lineHeight: 21,
          fontWeight: isCorrect ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
