import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../lib/useTheme';
import { mono } from '../lib/theme';

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
  let border = tokens.border;
  let bg = tokens.panel;
  if (state === 'correct' || state === 'reveal') {
    border = tokens.good;
    bg = tokens.panelAlt;
  } else if (state === 'wrong') {
    border = tokens.bad;
    bg = tokens.panelAlt;
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: border,
        backgroundColor: bg,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          backgroundColor: tokens.panelAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontFamily: mono, fontSize: 12, color: tokens.muted }}>
          {LETTERS[index]}
        </Text>
      </View>
      <Text style={{ flex: 1, color: tokens.ink, fontSize: 15, lineHeight: 21 }}>
        {label}
      </Text>
    </Pressable>
  );
}
