import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from './theme';

export interface PopoverAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PopoverProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  anchor?: PopoverAnchor | null;
  testID?: string;
}

const POPOVER_WIDTH = 250;
const ANCHOR_GAP = 4;
const SCREEN_EDGE_PADDING = 16;

// Anchored popover: full-screen Modal with a transparent dismiss backdrop and
// a positioned card. When `anchor` is provided the card is placed immediately
// below the anchor and right-aligned with it; otherwise it falls back to a
// screen-centered card.
export function Popover({ visible, onDismiss, children, anchor, testID }: PopoverProps) {
  const tokens = useTheme();
  const screen = useWindowDimensions();

  const positionStyle = anchor
    ? {
        position: 'absolute' as const,
        top: anchor.y + anchor.height + ANCHOR_GAP,
        left: Math.max(
          SCREEN_EDGE_PADDING,
          Math.min(anchor.x + anchor.width - POPOVER_WIDTH, screen.width - POPOVER_WIDTH - SCREEN_EDGE_PADDING)
        ),
      }
    : null;

  const wrapperStyle = [styles.shadowWrapper, { borderRadius: tokens.radii.medium }, positionStyle];
  const cardStyle = [
    styles.card,
    {
      backgroundColor: tokens.colors.background,
      borderColor: tokens.colors.border,
      borderRadius: tokens.radii.medium,
    },
  ];

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={visible}
      onRequestClose={onDismiss}
      animationType="fade"
      testID={testID}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        <View style={wrapperStyle}>
          <Pressable onPress={() => undefined} style={cardStyle}>
            <View>{children}</View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '100%',
  },
  root: {
    flex: 1,
  },
  // eslint-disable-next-line react-native/no-color-literals
  shadowWrapper: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: POPOVER_WIDTH,
  },
});
