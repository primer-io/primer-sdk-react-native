import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';
import { useNavigation } from './useNavigation';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';

export interface NavigationHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

export interface NavigationHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backLabel?: string;
  onBackPress?: () => void;
  rightAction?: NavigationHeaderAction;
  rightComponent?: React.ReactNode;
}

const ICON_SIZE = 20;
const CHEVRON_STROKE = 2;

function ChevronLeftIcon({ size, color }: { size: number; color: string }) {
  const armSize = Math.round(size * 0.4);
  return (
    // eslint-disable-next-line react-native/no-inline-styles -- dynamic size/color props require inline styles
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: armSize,
          height: armSize,
          borderLeftWidth: CHEVRON_STROKE,
          borderBottomWidth: CHEVRON_STROKE,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginLeft: armSize * 0.25,
        }}
      />
    </View>
  );
}

function ActionButton({
  action,
  styles,
  hitSlop,
}: {
  action: NavigationHeaderAction;
  styles: ReturnType<typeof createStyles>;
  hitSlop: { top: number; bottom: number; left: number; right: number };
}) {
  return (
    <TouchableOpacity onPress={action.onPress} style={styles.actionButton} hitSlop={hitSlop}>
      {action.icon != null && (
        <>
          {action.icon}
          <View style={styles.actionIconGap} />
        </>
      )}
      <Text style={styles.actionLabel}>{action.label}</Text>
    </TouchableOpacity>
  );
}

export function NavigationHeader({
  title,
  showBackButton = false,
  backLabel,
  onBackPress,
  rightAction,
  rightComponent,
}: NavigationHeaderProps) {
  const { pop } = useNavigation();
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const handleBackPress = onBackPress ?? pop;
  const hitSlop = useMemo(
    () => ({
      top: tokens.spacing.medium,
      bottom: tokens.spacing.medium,
      left: tokens.spacing.small,
      right: tokens.spacing.small,
    }),
    [tokens.spacing.medium, tokens.spacing.small]
  );

  const rightElement = rightAction ? (
    <ActionButton action={rightAction} styles={styles} hitSlop={hitSlop} />
  ) : (
    (rightComponent ?? null)
  );

  if (showBackButton) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBackPress} style={styles.actionButton} hitSlop={hitSlop}>
            <ChevronLeftIcon size={ICON_SIZE} color={tokens.colors.iconPrimary} />
            {backLabel != null && (
              <>
                <View style={styles.actionIconGap} />
                <Text style={styles.actionLabel}>{backLabel}</Text>
              </>
            )}
          </TouchableOpacity>
          <View style={styles.spacer} />
          {rightElement}
        </View>
        {title != null && <Text style={[styles.title, styles.titleTopMargin]}>{title}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.singleRow}>
        {title != null && <Text style={[styles.title, styles.titleFlex]}>{title}</Text>}
        {rightElement}
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography, radii } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    actionButton: {
      alignItems: 'center',
      borderRadius: radii.small,
      flexDirection: 'row',
      paddingHorizontal: spacing.xxsmall,
    },
    actionIconGap: {
      width: spacing.xsmall,
    },
    actionLabel: {
      color: colors.textPrimary,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
    },
    container: {
      paddingHorizontal: spacing.large,
    },
    headerBar: {
      alignItems: 'center',
      flexDirection: 'row',
      height: spacing.xxlarge,
    },
    singleRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      paddingVertical: spacing.xxsmall,
    },
    spacer: {
      flex: 1,
    },
    title: {
      color: colors.textPrimary,
      fontFamily: typography.titleXLarge.fontFamily,
      fontSize: typography.titleXLarge.fontSize,
      fontWeight: typography.titleXLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleXLarge.letterSpacing,
      lineHeight: typography.titleXLarge.lineHeight,
    },
    titleFlex: {
      flex: 1,
    },
    titleTopMargin: {
      marginTop: spacing.large,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
