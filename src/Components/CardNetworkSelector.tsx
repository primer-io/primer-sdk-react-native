import { useRef, useState, type ComponentRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCardNetworkSelection } from './hooks/useCardNetworkSelection';
import { Popover, type PopoverAnchor } from './internal/Popover';
import { CardNetworkBadge } from './internal/CardNetworkBadge';
import { useTheme } from './internal/theme';
import { TRAILING_ICON_MARGIN } from './inputs/dimensions';

const LOG = '[CardNetworkSelector]';

const CHEVRON_SIZE = 24;
const CHEVRON_GAP = 4;
const chevronDownIcon = require('./internal/screens/assets/chevron-down.png');

export interface CardNetworkSelectorProps {
  testID?: string;
}

// Trailing adornment for the card-number input when 2+ networks are detected.
// Three rendering modes (decided by useCardNetworkSelection):
//   - none      → returns null (caller falls back to its single-network icon)
//   - dual-badge → side-by-side badges, no chevron (EFTPOS + Visa case)
//   - selectable → selected badge + chevron, popover list on tap
export function CardNetworkSelector({ testID }: CardNetworkSelectorProps) {
  const tokens = useTheme();
  const { availableNetworks, selectedIdentifier, displayedIdentifier, isSelectorVisible, isDualBadge, selectNetwork } =
    useCardNetworkSelection();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [anchor, setAnchor] = useState<PopoverAnchor | null>(null);
  const triggerRef = useRef<ComponentRef<typeof View>>(null);

  if (!isSelectorVisible && !isDualBadge) return null;

  if (isDualBadge) {
    return (
      <View style={styles.row} testID={testID}>
        {availableNetworks.map((n, idx) => (
          <CardNetworkBadge
            key={n.identifier}
            identifier={n.identifier}
            marginLeft={idx === 0 ? TRAILING_ICON_MARGIN : 4}
            testID={testID ? `${testID}-badge-${n.identifier}` : undefined}
          />
        ))}
      </View>
    );
  }

  const openPopover = () => {
    console.log(
      `${LOG} open popover (selected=${selectedIdentifier ?? 'nil'} displayed=${displayedIdentifier ?? 'nil'})`
    );
    triggerRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      setAnchor({ x, y, width, height });
      setPopoverOpen(true);
    });
  };
  const closePopover = () => setPopoverOpen(false);

  return (
    <View ref={triggerRef} collapsable={false}>
      <Pressable
        onPress={openPopover}
        style={styles.trigger}
        testID={testID ? `${testID}-trigger` : undefined}
        accessibilityRole="button"
        accessibilityLabel="Select card network"
      >
        {displayedIdentifier ? (
          <CardNetworkBadge identifier={displayedIdentifier} marginLeft={TRAILING_ICON_MARGIN} />
        ) : null}
        <Image
          source={chevronDownIcon}
          style={[styles.chevron, { tintColor: tokens.colors.iconPrimary }]}
          resizeMode="contain"
        />
      </Pressable>
      <Popover
        visible={popoverOpen}
        onDismiss={closePopover}
        anchor={anchor}
        testID={testID ? `${testID}-popover` : undefined}
      >
        {availableNetworks.map((n, idx) => {
          const isSelected = displayedIdentifier === n.identifier;
          const isLast = idx === availableNetworks.length - 1;
          return (
            <View key={n.identifier}>
              <Pressable
                onPress={async () => {
                  console.log(`${LOG} option tapped ${n.identifier}`);
                  closePopover();
                  try {
                    await selectNetwork(n.identifier);
                  } catch (err) {
                    console.warn(`${LOG} selectNetwork failed: ${String(err)}`);
                  }
                }}
                style={({ pressed }) => [styles.option, pressed ? { backgroundColor: tokens.colors.surface } : null]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={n.displayName}
                testID={testID ? `${testID}-option-${n.identifier}` : undefined}
              >
                <View style={styles.checkSlot}>
                  {isSelected ? (
                    <Text
                      style={{
                        color: tokens.colors.textPrimary,
                        fontFamily: tokens.typography.fontFamily,
                        fontSize: tokens.typography.bodyLarge.fontSize,
                      }}
                    >
                      ✓
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={{
                    color: tokens.colors.textPrimary,
                    fontFamily: tokens.typography.fontFamily,
                    fontSize: tokens.typography.bodyLarge.fontSize,
                  }}
                >
                  {n.displayName}
                </Text>
              </Pressable>
              {isLast ? null : <View style={styles.separator} />}
            </View>
          );
        })}
      </Popover>
    </View>
  );
}

const styles = StyleSheet.create({
  checkSlot: {
    alignItems: 'center',
    width: 20,
  },
  chevron: {
    height: CHEVRON_SIZE,
    marginHorizontal: CHEVRON_GAP,
    width: CHEVRON_SIZE,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  // eslint-disable-next-line react-native/no-color-literals
  separator: {
    backgroundColor: '#8080808C',
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  trigger: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
