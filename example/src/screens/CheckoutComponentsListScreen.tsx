import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PrimerCheckoutProvider, PrimerCheckoutSheet } from '@primer-io/react-native';
import type { PrimerSettings, PrimerThemeOverride } from '@primer-io/react-native';

import { createClientSession } from '../network/api';
import { buildCheckoutComponentsSettings } from './checkoutComponentsSettings';

// Everything an overlay example needs once its client token is ready.
interface OverlayContext {
  clientToken: string;
  settings: PrimerSettings;
  /** Drives the overlay's open/close animation. */
  visible: boolean;
  /** Begin dismissal — sets `visible` to false so the overlay can animate out. */
  requestClose: () => void;
  /** Dismissal finished — unmounts the overlay. */
  onClosed: () => void;
}

// How an example presents itself once we have a token. Overlays (sheets, modals,
// popups) render in place on this screen; `screen` examples are pushed onto the
// navigation stack and read the token from route params. New presentation styles
// slot in as either an `overlay` render fn or another `screen` route.
type ExamplePresentation =
  | { kind: 'overlay'; render: (ctx: OverlayContext) => React.ReactNode }
  | { kind: 'screen'; route: string };

// Customization tiers: T1 drop-in · T2 theming · T3 custom layout with Primer
// components · T4 merchant UI on Primer hooks only.
type Tier = 'T1' | 'T2' | 'T3' | 'T4';

const TIER_COLORS: Record<Tier, string> = {
  T1: '#6B7280',
  T2: '#2563EB',
  T3: '#7C3AED',
  T4: '#EA580C',
};

interface Example {
  id: string;
  title: string;
  /** Mixed-tier examples get one badge per tier. */
  tiers: Tier[];
  /** What capability this example demonstrates (not what content it renders). */
  description: string;
  present: ExamplePresentation;
}

// One theme prop turns the stock drop-in into a branded one — same sheet, same
// flow, boutique skin. Every sheet screen (methods, card form, status) inherits it.
const BOUTIQUE_THEME: PrimerThemeOverride = {
  light: {
    colors: {
      primary: '#166534',
      borderFocused: '#166534',
      background: '#F7F4EE',
      surface: '#FFFFFF',
      border: '#DDD6C7',
      textPrimary: '#1C2A23',
      textSecondary: '#67705F',
    },
    radii: { small: 14, medium: 18, large: 22 },
  },
};

const EXAMPLES: Example[] = [
  {
    id: 'default',
    title: 'Drop-in checkout',
    tiers: ['T1'],
    description: 'Mount one component — the sheet runs the whole flow for you',
    present: {
      kind: 'overlay',
      render: ({ clientToken, settings, visible, requestClose, onClosed }) => (
        <PrimerCheckoutProvider
          clientToken={clientToken}
          settings={settings}
          onCheckoutComplete={(checkoutData) => {
            console.log('Checkout complete:', checkoutData);
          }}
          onError={(error) => {
            console.error('Checkout error:', error);
            Alert.alert('Checkout Error', error.errorId ?? 'Unknown error');
          }}
        >
          <PrimerCheckoutSheet
            visible={visible}
            onRequestDismiss={requestClose}
            onDismiss={onClosed}
          />
        </PrimerCheckoutProvider>
      ),
    },
  },
  {
    id: 'themed-dropin',
    title: 'Themed drop-in',
    tiers: ['T2'],
    description: 'Re-brand the entire drop-in with a single theme prop',
    present: {
      kind: 'overlay',
      render: ({ clientToken, settings, visible, requestClose, onClosed }) => (
        <PrimerCheckoutProvider
          clientToken={clientToken}
          settings={settings}
          theme={BOUTIQUE_THEME}
          onCheckoutComplete={(checkoutData) => {
            console.log('Checkout complete:', checkoutData);
          }}
          onError={(error) => {
            console.error('Checkout error:', error);
            Alert.alert('Checkout Error', error.errorId ?? 'Unknown error');
          }}
        >
          <PrimerCheckoutSheet
            visible={visible}
            onRequestDismiss={requestClose}
            onDismiss={onClosed}
          />
        </PrimerCheckoutProvider>
      ),
    },
  },
  {
    id: 'custom-payment-selection',
    title: 'eSIM marketplace',
    tiers: ['T3'],
    description: 'Compose your own checkout page from our method list, inputs & hooks',
    present: { kind: 'screen', route: 'CustomPaymentSelection' },
  },
  {
    id: 'accordion',
    title: 'Accordion checkout',
    tiers: ['T3'],
    description: 'Embed our card form inside your own flow & interaction model',
    present: { kind: 'screen', route: 'AccordionCheckout' },
  },
  {
    id: 'coin-topup',
    title: 'Coin top-up popup',
    tiers: ['T3'],
    description: 'Run checkout inside any container — here a compact popup dialog',
    present: { kind: 'screen', route: 'CoinTopUp' },
  },
  {
    id: 'coffee-reorder',
    title: 'Coffee reorder — one tap',
    tiers: ['T3', 'T4'],
    description: 'Saved cards from the vault hook — instant repurchase, new-card fallback',
    present: { kind: 'screen', route: 'CoffeeReorder' },
  },
  {
    id: 'card-preview',
    title: 'Card preview — slide to pay',
    tiers: ['T3', 'T4'],
    description: 'Mirror live form state into custom visuals; submit with a gesture',
    present: { kind: 'screen', route: 'CardPreview' },
  },
  {
    id: 'hooks-only',
    title: 'Bring-your-own UI',
    tiers: ['T4'],
    description: 'No Primer UI at all — your inputs & network picker, driven by our hooks',
    present: { kind: 'screen', route: 'HooksOnly' },
  },
];

export function CheckoutComponentsListScreen({
  navigation,
}: {
  navigation: { navigate: (name: string, params?: { clientToken: string }) => void };
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [active, setActive] = useState<{
    example: Example;
    clientToken: string;
    visible: boolean;
  } | null>(null);

  const settings = buildCheckoutComponentsSettings();

  const handleOpen = async (example: Example) => {
    setLoadingId(example.id);
    try {
      const { clientToken } = await createClientSession();
      if (example.present.kind === 'screen') {
        navigation.navigate(example.present.route, { clientToken });
      } else {
        setActive({ example, clientToken, visible: true });
      }
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <ScrollView style={componentStyles.container}>
        {EXAMPLES.map((example) => (
          <TouchableOpacity
            key={example.id}
            style={componentStyles.item}
            onPress={() => handleOpen(example)}
            disabled={loadingId !== null}
          >
            <View style={componentStyles.itemContent}>
              <View style={componentStyles.titleRow}>
                {example.tiers.map((tier) => (
                  <View key={tier} style={[componentStyles.tierBadge, { backgroundColor: TIER_COLORS[tier] }]}>
                    <Text style={componentStyles.tierBadgeText}>{tier}</Text>
                  </View>
                ))}
                <Text style={componentStyles.itemTitle}>{example.title}</Text>
              </View>
              <Text style={componentStyles.itemDescription}>{example.description}</Text>
            </View>
            {loadingId === example.id && <ActivityIndicator />}
          </TouchableOpacity>
        ))}
      </ScrollView>
      {active && active.example.present.kind === 'overlay'
        ? active.example.present.render({
            clientToken: active.clientToken,
            settings,
            visible: active.visible,
            requestClose: () => setActive((a) => (a ? { ...a, visible: false } : null)),
            onClosed: () => setActive(null),
          })
        : null}
    </>
  );
}

const componentStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  item: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemDescription: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  itemTitle: {
    color: '#212121',
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  tierBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tierBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
