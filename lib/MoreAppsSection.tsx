// lib/MoreAppsSection.tsx
// Named ...Section because lib/moreApps.ts already exists and macOS is
// case-insensitive: two files differing only in case resolve to one.
// The "More from Simon Shih" block at the foot of Settings. Three sibling apps,
// each opening its App Store page. Inline styles and the mono face, to match the
// rest of this screen. No network: the list is static data from moreApps.ts.

import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { mono } from './theme';
import { useTheme } from './useTheme';
import { FleetApp, relatedApps, storeUrl } from './moreApps';

export default function MoreApps() {
  const { tokens } = useTheme();
  const apps = relatedApps();
  if (apps.length === 0) return null;

  const open = (app: FleetApp) => {
    // openURL rejects when nothing can handle the scheme; nothing useful to say.
    Linking.openURL(storeUrl(app)).catch(() => {});
  };

  return (
    <View style={{ marginTop: 28 }}>
      <Text style={{ fontFamily: mono, fontSize: 12, letterSpacing: 0.5, color: tokens.muted, marginBottom: 10 }}>
        MORE FROM SIMON SHIH
      </Text>
      <View
        style={{
          backgroundColor: tokens.panel,
          borderRadius: 9,
          borderWidth: 1,
          borderColor: tokens.border,
          paddingHorizontal: 12,
        }}
      >
        {apps.map((app, i) => (
          <Pressable
            key={app.key}
            onPress={() => open(app)}
            accessibilityRole="link"
            accessibilityLabel={`${app.name}, ${app.line}. Opens the App Store.`}
            style={{
              paddingVertical: 12,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: tokens.border,
            }}
          >
            <Text style={{ fontFamily: mono, fontSize: 13, color: tokens.accent }}>{app.name}</Text>
            <Text style={{ fontFamily: mono, fontSize: 11, color: tokens.muted, marginTop: 3 }}>{app.line}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
