import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { SheetHeightContext } from './SheetHeightContext';
import type { SheetHeightContextValue } from './SheetHeightContext';
import type { CheckoutSheetProps } from './types';

const ANIMATION_DURATION = 300;
const DEFAULT_HEIGHT_RATIO = 0.92;
const MIN_HEIGHT_RATIO = 0.1;

export function CheckoutSheet({
  visible,
  onDismiss,
  onRequestDismiss,
  dismissOnBackdropPress = true,
  children,
}: CheckoutSheetProps) {
  const tokens = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const [modalVisible, setModalVisible] = useState(false);
  const [heightRatio, setHeightRatioState] = useState(DEFAULT_HEIGHT_RATIO);

  // Show/hide animation: 0 = hidden (off-screen below), 1 = fully shown
  const showAnimValue = useRef(new Animated.Value(0)).current;
  // Height offset: translateY to push the sheet down so only the desired height is visible.
  // 0 = full screen, (screenHeight - sheetHeight) = shows only sheetHeight from the bottom.
  const heightOffsetValue = useRef(new Animated.Value(screenHeight * (1 - DEFAULT_HEIGHT_RATIO))).current;
  const isMountedRef = useRef(true);

  const sheetHeight = screenHeight * heightRatio;
  const heightOffset = screenHeight - sheetHeight;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Animate height offset when heightRatio changes
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
        onDismiss?.();
      }
    });
  }, [showAnimValue, onDismiss]);

  // Handle visible prop changes
  const prevVisibleRef = useRef(visible);
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setModalVisible(true);
    } else if (!visible && prevVisibleRef.current && modalVisible) {
      animateOut();
    }
    prevVisibleRef.current = visible;
  }, [visible, modalVisible, animateOut]);

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

  const sheetHeightContextValue = useMemo<SheetHeightContextValue>(
    () => ({
      setHeight: (h: number) => setHeightRatioState(Math.max(MIN_HEIGHT_RATIO, Math.min(1, h / screenHeight))),
      setHeightRatio: (ratio: number) => setHeightRatioState(Math.max(MIN_HEIGHT_RATIO, Math.min(1, ratio))),
    }),
    [screenHeight]
  );

  // Show/hide: slide the entire sheet from below the screen to its resting position
  const showTranslateY = showAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  // Combined translateY: show animation + height offset
  const translateY = Animated.add(showTranslateY, heightOffsetValue);

  const backdropOpacity = showAnimValue;

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
