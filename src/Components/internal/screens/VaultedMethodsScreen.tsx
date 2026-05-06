import { useCallback, useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ListRenderItemInfo, TextStyle } from 'react-native';

import { PrimerAnalytics } from '../../analytics';
import { useVaultedPaymentMethods } from '../../hooks/useVaultedPaymentMethods';
import type { VaultedPaymentMethodItem } from '../../types/VaultedPaymentMethodTypes';
import { useLocalization } from '../localization';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { useBottomSafeArea } from './useBottomSafeArea';

const BRAND_CHIP_WIDTH = 22.4;
const BRAND_CHIP_HEIGHT = 16;
const CHECK_ICON_SIZE = 20;

interface VaultedMethodRowProps {
  method: VaultedPaymentMethodItem;
  isActive: boolean;
  accessibilityLabel: string;
  onPress: () => void;
}

function VaultedMethodRow({ method, isActive, accessibilityLabel, onPress }: VaultedMethodRowProps) {
  const tokens = useTheme();
  const styles = useMemo(() => createRowStyles(tokens, isActive), [tokens, isActive]);
  const { t } = useLocalization();

  const maskedNumber = method.last4 != null ? t('primer_vault_format_masked', { last4: method.last4 }) : null;
  const expiryText =
    method.expiryMonth != null && method.expiryYear != null
      ? t('primer_vault_format_expires', { month: method.expiryMonth, year: method.expiryYear })
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={styles.tile}
    >
      <View style={styles.row}>
        <View style={styles.leftCol}>
          {method.cardholderName != null && (
            <Text style={styles.primaryText} numberOfLines={1}>
              {method.cardholderName}
            </Text>
          )}
          <View style={styles.brandRow}>
            {method.brandIconUri != null && (
              <View style={styles.brandChip}>
                <Image source={{ uri: method.brandIconUri }} style={styles.brandIcon} resizeMode="contain" />
              </View>
            )}
            {method.brandName != null && (
              <Text style={styles.secondaryText} numberOfLines={1}>
                {method.brandName}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightCol}>
          {maskedNumber != null && <Text style={styles.mediumText}>{maskedNumber}</Text>}
          {expiryText != null && <Text style={styles.secondaryText}>{expiryText}</Text>}
        </View>
        {isActive && (
          <View style={styles.checkIconBox} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text style={styles.checkIconGlyph}>✓</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function VaultedMethodsScreen() {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = useLocalization();
  const { vaultedMethods, activeMethod, selectVaultedMethodId } = useVaultedPaymentMethods();
  const { pop } = useNavigation();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);

  const buildRowAccessibilityLabel = useCallback(
    (method: VaultedPaymentMethodItem) => {
      if (method.brandName != null && method.last4 != null && method.expiryMonth != null && method.expiryYear != null) {
        return t('accessibility_vaulted_card_full', {
          cardNetwork: method.brandName,
          last4: method.last4,
          expiry: t('primer_vault_format_expires', { month: method.expiryMonth, year: method.expiryYear }),
          cardholderName: method.cardholderName ?? '',
        });
      }
      return t('accessibility_vaulted_payment_method', {
        paymentMethodName: method.brandName ?? method.paymentMethodType,
      });
    },
    [t]
  );

  const handleSelect = useCallback(
    (method: VaultedPaymentMethodItem) => {
      const fromId = activeMethod?.id ?? '';
      // Only emit the analytics event when the method actually changes — re-tapping
      // the active row still flips to lite but isn't a "switch".
      if (method.id !== fromId) {
        void PrimerAnalytics.trackEvent('VAULT_METHOD_SELECTED', {
          fromVaultedMethodId: fromId,
          toVaultedMethodId: method.id,
        });
      }
      selectVaultedMethodId(method.id);
      pop();
    },
    [activeMethod, pop, selectVaultedMethodId]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<VaultedPaymentMethodItem>) => (
      <VaultedMethodRow
        method={item}
        isActive={item.id === activeMethod?.id}
        accessibilityLabel={buildRowAccessibilityLabel(item)}
        onPress={() => handleSelect(item)}
      />
    ),
    [activeMethod, buildRowAccessibilityLabel, handleSelect]
  );

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <NavigationHeader title={t('primer_vault_manage_title')} showBackButton backLabel={t('primer_common_back')} />
      <FlatList
        data={vaultedMethods}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

function keyExtractor(item: VaultedPaymentMethodItem) {
  return item.id;
}

function Separator() {
  const tokens = useTheme();
  return <View style={{ height: tokens.spacing.small }} />;
}

function createStyles(tokens: PrimerTokens) {
  const { spacing } = tokens;
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: spacing.large,
    },
    listContent: {
      paddingHorizontal: spacing.large,
      paddingTop: spacing.xxlarge,
    },
  });
}

function createRowStyles(tokens: PrimerTokens, isActive: boolean) {
  const { colors, spacing, radii, borders, typography } = tokens;
  // Match the overall tile size between active (2px border) and default (1px) by
  // compensating padding so inner content doesn't shift by 1px on toggle.
  const innerPadding = isActive ? spacing.medium - 1 : spacing.medium;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    brandChip: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.xsmall,
      height: BRAND_CHIP_HEIGHT,
      justifyContent: 'center',
      overflow: 'hidden',
      width: BRAND_CHIP_WIDTH,
    },
    brandIcon: {
      height: BRAND_CHIP_HEIGHT,
      width: BRAND_CHIP_WIDTH,
    },
    brandRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xsmall,
    },
    checkIconBox: {
      alignItems: 'center',
      height: CHECK_ICON_SIZE,
      justifyContent: 'center',
      width: CHECK_ICON_SIZE,
    },
    checkIconGlyph: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: '600',
      lineHeight: CHECK_ICON_SIZE,
    },
    leftCol: {
      flex: 1,
      gap: spacing.xsmall,
      justifyContent: 'center',
    },
    mediumText: {
      color: colors.textPrimary,
      fontFamily: typography.bodyMedium.fontFamily,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyMedium.letterSpacing,
      lineHeight: typography.bodyMedium.lineHeight,
      textAlign: 'right',
    },
    primaryText: {
      color: colors.textPrimary,
      fontFamily: typography.bodyLarge.fontFamily,
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: typography.bodyLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyLarge.letterSpacing,
      lineHeight: typography.bodyLarge.lineHeight,
    },
    rightCol: {
      alignItems: 'flex-end',
      gap: spacing.xsmall,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.medium,
    },
    secondaryText: {
      color: colors.textSecondary,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodySmall.letterSpacing,
      lineHeight: typography.bodySmall.lineHeight,
    },
    tile: {
      backgroundColor: colors.background,
      borderColor: isActive ? colors.primary : colors.border,
      borderRadius: radii.medium,
      borderWidth: isActive ? borders.strong : borders.default,
      padding: innerPadding,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
