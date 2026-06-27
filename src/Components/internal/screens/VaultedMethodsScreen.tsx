import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ListRenderItemInfo, TextStyle } from 'react-native';

import { PrimerAnalytics } from '../../analytics';
import { usePrimerVaultManager } from '../../hooks/usePrimerVaultManager';
import type { VaultedPaymentMethodItem } from '../../types/VaultedPaymentMethodTypes';
import { usePrimerLocalization } from '../localization';
import { NavigationHeader } from '../navigation/NavigationHeader';
import type { NavigationHeaderAction } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { CheckoutButton } from '../ui/CheckoutButton';
import { useBottomSafeArea } from './useBottomSafeArea';
import { useStatusScreenHeight } from './useStatusScreenHeight';

const BRAND_CHIP_WIDTH = 22.4;
const BRAND_CHIP_HEIGHT = 16;
const CHECK_ICON_SIZE = 20;
const DELETE_ICON_SIZE = 20;
const HEADER_ICON_SIZE = 20;
const closeIcon = require('./assets/close.png');
const checkIcon = require('./assets/check.png'); // blue — active-row indicator
const doneIcon = require('./assets/done.png'); // black — header Done button
const editIcon = require('./assets/edit.png');

interface VaultedMethodRowProps {
  method: VaultedPaymentMethodItem;
  isActive: boolean;
  /** When false, the active row is rendered without the blue border or checkmark (edit / confirmation states). */
  showActiveTreatment: boolean;
  /** When true, an X delete affordance is rendered to the right of the tile. */
  showDeleteAction: boolean;
  accessibilityLabel: string;
  deleteAccessibilityLabel?: string;
  onPress?: () => void;
  onDeletePress?: () => void;
  isInteractive: boolean;
}

function VaultedMethodRow({
  method,
  isActive,
  showActiveTreatment,
  showDeleteAction,
  accessibilityLabel,
  deleteAccessibilityLabel,
  onPress,
  onDeletePress,
  isInteractive,
}: VaultedMethodRowProps) {
  const tokens = usePrimerTheme();
  const styles = useMemo(
    () => createRowStyles(tokens, isActive && showActiveTreatment),
    [tokens, isActive, showActiveTreatment]
  );
  const { t } = usePrimerLocalization();

  const maskedNumber = method.last4 != null ? t('primer_vault_format_masked', { last4: method.last4 }) : null;
  const expiryText =
    method.expiryMonth != null && method.expiryYear != null
      ? t('primer_vault_format_expires', { month: method.expiryMonth, year: method.expiryYear })
      : null;

  const tile = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isActive && showActiveTreatment, disabled: !isInteractive }}
      onPress={isInteractive ? onPress : undefined}
      style={[styles.tile, !showDeleteAction && styles.tileFull]}
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
        {isActive && showActiveTreatment && (
          <View style={styles.checkIconBox} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Image source={checkIcon} style={styles.checkIcon} resizeMode="contain" />
          </View>
        )}
      </View>
    </Pressable>
  );

  if (!showDeleteAction) {
    return tile;
  }

  return (
    <View style={styles.rowContainer}>
      <View style={styles.tileWrap}>{tile}</View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={deleteAccessibilityLabel}
        onPress={onDeletePress}
        disabled={!isInteractive}
        style={styles.deleteButton}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      >
        <Image source={closeIcon} style={styles.deleteIcon} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

export function VaultedMethodsScreen() {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const { vaultedMethods, activeMethod, selectVaultedMethodId, deleteVaultedPaymentMethod } = usePrimerVaultManager();
  const { pop } = useNavigation();
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);

  const [editMode, setEditMode] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<VaultedPaymentMethodItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Shrink the sheet to fit just the confirmation surface (single tile + caption + buttons row)
  // instead of the default 92%. Figma 366:69230.
  const confirmationSheetHeight = useMemo(() => {
    const headerArea =
      tokens.spacing.large + tokens.spacing.xxlarge + tokens.spacing.large + tokens.typography.titleXLarge.lineHeight;
    const tileHeight = tokens.spacing.medium * 2 + tokens.typography.bodyLarge.lineHeight + tokens.spacing.xsmall + 16;
    const buttonsRowHeight = tokens.spacing.medium * 2 + tokens.typography.titleLarge.lineHeight;
    const contentArea =
      tileHeight +
      tokens.spacing.small +
      tokens.typography.bodySmall.lineHeight +
      tokens.spacing.small +
      buttonsRowHeight;
    return headerArea + tokens.spacing.xxlarge + contentArea + bottomInset + tokens.spacing.xlarge;
  }, [tokens, bottomInset]);

  // FR-014: if the targeted row vanishes from the underlying list (session refresh, external delete),
  // dismiss the confirmation silently rather than leaving the user staring at a stale tile.
  useEffect(() => {
    if (pendingDeletion != null && !vaultedMethods.some((m) => m.id === pendingDeletion.id)) {
      setPendingDeletion(null);
    }
  }, [vaultedMethods, pendingDeletion]);

  // FR-013: after the last method is deleted, exit the screen so the previous surface re-renders
  // with the vault block hidden. Guarded on `!isDeleting` so we only fire once the in-flight resolves.
  useEffect(() => {
    if (vaultedMethods.length === 0 && !isDeleting) {
      pop();
    }
  }, [vaultedMethods.length, isDeleting, pop]);

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
      if (editMode) return;
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
    [editMode, activeMethod, pop, selectVaultedMethodId]
  );

  const handleEnterEditMode = useCallback(() => {
    void PrimerAnalytics.trackEvent('VAULT_EDIT_MODE_ENTERED', {
      vaultedMethodCount: String(vaultedMethods.length),
    });
    setEditMode(true);
  }, [vaultedMethods.length]);

  const handleExitEditMode = useCallback(() => {
    if (isDeleting) return;
    void PrimerAnalytics.trackEvent('VAULT_EDIT_MODE_EXITED', {
      exitedFromConfirmation: String(pendingDeletion != null),
    });
    setEditMode(false);
    setPendingDeletion(null);
  }, [isDeleting, pendingDeletion]);

  const handleRequestDelete = useCallback(
    (method: VaultedPaymentMethodItem) => {
      void PrimerAnalytics.trackEvent('VAULT_DELETION_REQUESTED', {
        vaultedMethodId: method.id,
        isActive: String(method.id === activeMethod?.id),
      });
      setPendingDeletion(method);
    },
    [activeMethod]
  );

  const handleCancelDelete = useCallback(() => {
    if (isDeleting || pendingDeletion == null) return;
    void PrimerAnalytics.trackEvent('VAULT_DELETION_CANCELLED', {
      vaultedMethodId: pendingDeletion.id,
    });
    setPendingDeletion(null);
  }, [isDeleting, pendingDeletion]);

  const handleConfirmDelete = useCallback(async () => {
    if (isDeleting || pendingDeletion == null) return;
    const target = pendingDeletion;
    const wasActive = target.id === activeMethod?.id;
    setIsDeleting(true);
    try {
      await deleteVaultedPaymentMethod(target.id);
      // First remaining method (from the pre-delete closure list) is the one promoted when active.
      const promotedId = wasActive ? (vaultedMethods.find((m) => m.id !== target.id)?.id ?? '') : '';
      void PrimerAnalytics.trackEvent('VAULT_METHOD_DELETED', {
        vaultedMethodId: target.id,
        wasActive: String(wasActive),
        promotedVaultedMethodId: promotedId,
      });
      setPendingDeletion(null);
    } catch (err: unknown) {
      const errorId =
        typeof err === 'object' &&
        err != null &&
        'errorId' in err &&
        typeof (err as { errorId: unknown }).errorId === 'string'
          ? (err as { errorId: string }).errorId
          : 'UNKNOWN';
      void PrimerAnalytics.trackEvent('VAULT_METHOD_DELETION_FAILED', {
        vaultedMethodId: target.id,
        errorId,
        wasActive: String(wasActive),
      });
      Alert.alert(t('primer_common_error_generic'));
      setPendingDeletion(null);
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, pendingDeletion, activeMethod, deleteVaultedPaymentMethod, vaultedMethods, t]);

  const headerRightAction = useMemo<NavigationHeaderAction>(() => {
    if (editMode) {
      return {
        label: t('primer_vault_manage_button_done'),
        icon: <Image source={doneIcon} style={styles.headerIcon} resizeMode="contain" />,
        onPress: handleExitEditMode,
      };
    }
    return {
      label: t('primer_vault_manage_button_edit'),
      icon: <Image source={editIcon} style={styles.headerIcon} resizeMode="contain" />,
      onPress: handleEnterEditMode,
    };
  }, [editMode, t, styles.headerIcon, handleEnterEditMode, handleExitEditMode]);

  const headerBackHandler = isDeleting ? noop : undefined;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<VaultedPaymentMethodItem>) => (
      <VaultedMethodRow
        method={item}
        isActive={item.id === activeMethod?.id}
        showActiveTreatment={!editMode}
        showDeleteAction={editMode}
        isInteractive={!isDeleting}
        accessibilityLabel={buildRowAccessibilityLabel(item)}
        deleteAccessibilityLabel={t('accessibility_vault_delete_payment_method')}
        onPress={() => handleSelect(item)}
        onDeletePress={() => handleRequestDelete(item)}
      />
    ),
    [activeMethod, editMode, isDeleting, buildRowAccessibilityLabel, t, handleSelect, handleRequestDelete]
  );

  const showConfirmation = pendingDeletion != null;

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <NavigationHeader
        title={t('primer_vault_manage_title')}
        showBackButton
        backLabel={t('primer_common_back')}
        onBackPress={headerBackHandler}
        rightAction={headerRightAction}
      />
      {showConfirmation ? (
        <View style={styles.confirmationContent}>
          <ConfirmationSheetHeight height={confirmationSheetHeight} />
          <VaultedMethodRow
            method={pendingDeletion}
            isActive={pendingDeletion.id === activeMethod?.id}
            showActiveTreatment={false}
            showDeleteAction={false}
            isInteractive={false}
            accessibilityLabel={buildRowAccessibilityLabel(pendingDeletion)}
          />
          <Text style={styles.confirmationCaption}>{t('primer_vault_delete_message')}</Text>
          <View style={styles.confirmationButtons}>
            <View style={styles.confirmationButtonHalf}>
              <CheckoutButton
                title={t('primer_vault_delete_button_cancel')}
                variant="outlined"
                onPress={handleCancelDelete}
                disabled={isDeleting}
              />
            </View>
            <View style={styles.confirmationButtonHalf}>
              <CheckoutButton
                title={t('primer_vault_delete_button_confirm')}
                variant="primary"
                onPress={handleConfirmDelete}
                loading={isDeleting}
              />
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={vaultedMethods}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

function noop() {}

// Mounts only while the confirmation view is shown — registers the smaller sheet height
// for that surface, releasing it (sheet animates back to default 92%) when unmounted.
function ConfirmationSheetHeight({ height }: { height: number }) {
  useStatusScreenHeight(height);
  return null;
}

function keyExtractor(item: VaultedPaymentMethodItem) {
  return item.id;
}

function Separator() {
  const tokens = usePrimerTheme();
  return <View style={{ height: tokens.spacing.small }} />;
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography } = tokens;

  return StyleSheet.create({
    confirmationButtonHalf: {
      flex: 1,
    },
    confirmationButtons: {
      flexDirection: 'row',
      gap: spacing.small,
    },
    confirmationCaption: {
      color: colors.textSecondary,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodySmall.letterSpacing,
      lineHeight: typography.bodySmall.lineHeight,
    },
    confirmationContent: {
      gap: spacing.small,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.xxlarge,
    },
    container: {
      flex: 1,
      paddingTop: spacing.large,
    },
    headerIcon: {
      height: HEADER_ICON_SIZE,
      width: HEADER_ICON_SIZE,
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
    checkIcon: {
      height: CHECK_ICON_SIZE,
      width: CHECK_ICON_SIZE,
    },
    checkIconBox: {
      alignItems: 'center',
      height: CHECK_ICON_SIZE,
      justifyContent: 'center',
      width: CHECK_ICON_SIZE,
    },
    deleteButton: {
      alignItems: 'center',
      height: DELETE_ICON_SIZE,
      justifyContent: 'center',
      width: DELETE_ICON_SIZE,
    },
    deleteIcon: {
      height: DELETE_ICON_SIZE,
      width: DELETE_ICON_SIZE,
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
    rowContainer: {
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
    tileFull: {
      width: '100%',
    },
    tileWrap: {
      flex: 1,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
