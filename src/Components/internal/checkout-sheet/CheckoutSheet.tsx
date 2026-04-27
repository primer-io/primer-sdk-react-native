import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HeightReleaseFn } from './SheetHeightContext';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { SheetHeightContext } from './SheetHeightContext';
import type { SheetHeightContextValue } from './SheetHeightContext';
import type { CheckoutSheetProps } from './types';

const ANIMATION_DURATION = 300;
const SWIPE_DISMISS_DURATION = 200;
const DEFAULT_HEIGHT_RATIO = 0.92;
const MIN_HEIGHT_RATIO = 0.1;
const SWIPE_DISMISS_DISTANCE_RATIO = 0.25;
const SWIPE_DISMISS_VELOCITY = 0.5;

export function CheckoutSheet({
  visible,
  onDismiss,
  onRequestDismiss,
  dismissOnBackdropPress = true,
  dismissOnSwipeDown = true,
  showDragHandle,
  children,
}: CheckoutSheetProps) {
  const tokens = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const [modalVisible, setModalVisible] = useState(false);
  // Token-keyed stack: latest entry wins. Per-token release prevents a stale screen's
  // cleanup from clobbering the current screen's height request.
  const [heightRequests, setHeightRequests] = useState<Array<{ token: number; ratio: number }>>([]);
  const heightRatio =
    heightRequests.length > 0 ? heightRequests[heightRequests.length - 1]!.ratio : DEFAULT_HEIGHT_RATIO;
  const nextTokenRef = useRef(0);

  // 0 = hidden (off-screen below), 1 = fully shown.
  const showAnimValue = useRef(new Animated.Value(0)).current;
  // translateY that pushes the sheet down so only `heightRatio` of the screen shows.
  const heightOffsetValue = useRef(new Animated.Value(screenHeight * (1 - DEFAULT_HEIGHT_RATIO))).current;
  const dragValue = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);

  const sheetHeight = screenHeight * heightRatio;
  const heightOffset = screenHeight - sheetHeight;
  const shouldRenderDragHandle = showDragHandle ?? dismissOnSwipeDown;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    Animated.timing(heightOffsetValue, {
      toValue: heightOffset,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [heightOffset, heightOffsetValue]);

  const animateIn = useCallback(() => {
    Animated.timing(showAnimValue, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [showAnimValue]);

  const animateOut = useCallback(() => {
    Animated.timing(showAnimValue, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && isMountedRef.current) {
        setModalVisible(false);
        dragValue.setValue(0);
        onDismiss?.();
      }
    });
  }, [showAnimValue, dragValue, onDismiss]);

  const springDragBack = useCallback(() => {
    Animated.spring(dragValue, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [dragValue]);

  const dismissBySwipe = useCallback(() => {
    Animated.timing(dragValue, {
      toValue: sheetHeight,
      duration: SWIPE_DISMISS_DURATION,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && isMountedRef.current) {
        setModalVisible(false);
        dragValue.setValue(0);
        showAnimValue.setValue(0);
        onDismiss?.();
        onRequestDismiss?.();
      }
    });
  }, [dragValue, sheetHeight, showAnimValue, onDismiss, onRequestDismiss]);

  const prevVisibleRef = useRef(false);
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setHeightRequests([]);
      heightOffsetValue.setValue(screenHeight * (1 - DEFAULT_HEIGHT_RATIO));
      setModalVisible(true);
    } else if (!visible && prevVisibleRef.current && modalVisible) {
      animateOut();
    }
    prevVisibleRef.current = visible;
  }, [visible, modalVisible, animateOut, heightOffsetValue, screenHeight]);

  const handleShow = useCallback(() => {
    showAnimValue.setValue(0);
    animateIn();
  }, [showAnimValue, animateIn]);

  const handleBackdropPress = useCallback(() => {
    if (dismissOnBackdropPress) {
      onRequestDismiss?.();
    }
  }, [dismissOnBackdropPress, onRequestDismiss]);

  const handleRequestClose = useCallback(() => {
    onRequestDismiss?.();
  }, [onRequestDismiss]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => dismissOnSwipeDown,
        onMoveShouldSetPanResponder: (_, g) => dismissOnSwipeDown && g.dy > 2 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => {
          dragValue.setValue(Math.max(0, g.dy));
        },
        onPanResponderRelease: (_, g) => {
          const dismissed = g.dy > sheetHeight * SWIPE_DISMISS_DISTANCE_RATIO || g.vy > SWIPE_DISMISS_VELOCITY;
          if (dismissed) {
            dismissBySwipe();
          } else {
            springDragBack();
          }
        },
        onPanResponderTerminate: () => springDragBack(),
      }),
    [dismissOnSwipeDown, sheetHeight, dragValue, dismissBySwipe, springDragBack]
  );

  const sheetHeightContextValue = useMemo<SheetHeightContextValue>(() => {
    const register = (ratio: number): HeightReleaseFn => {
      const clamped = Math.max(MIN_HEIGHT_RATIO, Math.min(1, ratio));
      const token = nextTokenRef.current++;
      setHeightRequests((prev) => [...prev, { token, ratio: clamped }]);
      return () => {
        setHeightRequests((prev) => prev.filter((r) => r.token !== token));
      };
    };
    return {
      requestHeight: (h: number) => register(h / screenHeight),
      requestHeightRatio: (r: number) => register(r),
    };
  }, [screenHeight]);

  // Slide the entire sheet from below the screen to its resting position.
  const showTranslateY = showAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const translateY = Animated.add(Animated.add(showTranslateY, heightOffsetValue), dragValue);

  const backdropOpacity = Animated.multiply(
    showAnimValue,
    dragValue.interpolate({
      inputRange: [0, sheetHeight],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })
  );

  if (!modalVisible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onShow={handleShow}
      onRequestClose={handleRequestClose}
    >
      <View style={styles.fullScreen}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]} pointerEvents="box-none">
          <View style={styles.sheetContent}>
            {shouldRenderDragHandle && (
              <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
                <View style={styles.dragHandle} />
              </View>
            )}
            <SheetHeightContext.Provider value={sheetHeightContextValue}>
              <View style={styles.childrenContainer}>{children}</View>
            </SheetHeightContext.Provider>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* eslint-disable react-native/no-unused-styles */
function createStyles(tokens: PrimerTokens) {
  const { colors, radii } = tokens;

  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    childrenContainer: {
      flex: 1,
    },
    dragHandle: {
      backgroundColor: colors.textSecondary,
      borderRadius: 2,
      height: 4,
      opacity: 0.3,
      width: 40,
    },
    dragHandleArea: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 4,
      paddingTop: 12,
    },
    fullScreen: {
      flex: 1,
    },
    sheetContainer: {
      ...StyleSheet.absoluteFillObject,
      borderTopLeftRadius: radii.large,
      borderTopRightRadius: radii.large,
      overflow: 'hidden',
    },
    sheetContent: {
      backgroundColor: colors.background,
      flex: 1,
    },
  });
}
/* eslint-enable react-native/no-unused-styles */
