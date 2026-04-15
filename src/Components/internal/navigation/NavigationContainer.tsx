import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { NavigationContext, RouteEntryContext } from './NavigationContext';
import { useTheme } from '../theme';
import type { CheckoutRoute, RouteEntry } from './types';

const TRANSITION_DURATION = 250;

type TransitionType = 'push' | 'pop' | 'replace' | 'none';

interface NavigationContainerProps {
  screenMap: Partial<Record<CheckoutRoute, React.ComponentType>>;
}

interface TransitionState {
  type: TransitionType;
  outgoingEntry: RouteEntry | null;
}

const NO_TRANSITION: TransitionState = { type: 'none', outgoingEntry: null };

export function NavigationContainer({ screenMap }: NavigationContainerProps) {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('NavigationContainer must be used within a NavigationProvider');
  }

  const tokens = useTheme();
  const screenStyle = useMemo(
    () => [styles.screen, { backgroundColor: tokens.colors.background }],
    [tokens.colors.background]
  );
  const { width } = useWindowDimensions();
  const { state } = context;
  const current = state.stack[state.stack.length - 1]!;

  const prevEntryRef = useRef<RouteEntry>(current);
  const prevStackLengthRef = useRef(state.stack.length);
  const animValue = useRef(new Animated.Value(1)).current;
  const needsAnimationRef = useRef(false);

  const [transition, setTransition] = useState<TransitionState>(NO_TRANSITION);

  // Detect transition synchronously during render — before paint
  if (prevEntryRef.current.key !== current.key) {
    let type: TransitionType;
    if (state.stack.length > prevStackLengthRef.current) {
      type = 'push';
    } else if (state.stack.length < prevStackLengthRef.current) {
      type = 'pop';
    } else {
      type = 'replace';
    }

    // Set transition state synchronously so this render already shows both screens
    setTransition({ type, outgoingEntry: prevEntryRef.current });
    animValue.setValue(0);
    needsAnimationRef.current = true;

    prevEntryRef.current = current;
    prevStackLengthRef.current = state.stack.length;
  }

  const onTransitionEnd = useCallback(() => {
    setTransition(NO_TRANSITION);
    context.setAnimating(false);
  }, [context]);

  // Start the animation after the render with both screens visible
  useEffect(() => {
    if (!needsAnimationRef.current) return;
    needsAnimationRef.current = false;

    context.setAnimating(true);

    Animated.timing(animValue, {
      toValue: 1,
      duration: TRANSITION_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onTransitionEnd();
      }
    });
  }, [transition, context, animValue, onTransitionEnd]);

  const ScreenComponent = screenMap[current.route];
  const OutgoingComponent = transition.outgoingEntry ? screenMap[transition.outgoingEntry.route] : null;

  if (!ScreenComponent) {
    return null;
  }

  const renderScreen = (Component: React.ComponentType, entry: RouteEntry) => (
    <RouteEntryContext.Provider value={entry}>
      <Component />
    </RouteEntryContext.Provider>
  );

  if (transition.type === 'none' || !OutgoingComponent || !transition.outgoingEntry) {
    return <View style={styles.container}>{renderScreen(ScreenComponent, current)}</View>;
  }

  if (transition.type === 'replace') {
    return (
      <View style={styles.container}>
        <Animated.View style={[screenStyle, { opacity: Animated.subtract(1, animValue) }]}>
          {renderScreen(OutgoingComponent, transition.outgoingEntry)}
        </Animated.View>
        <Animated.View style={[screenStyle, { opacity: animValue }]}>
          {renderScreen(ScreenComponent, current)}
        </Animated.View>
      </View>
    );
  }

  if (transition.type === 'push') {
    const outgoingTranslate = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -width * 0.3],
    });
    const incomingTranslate = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [width, 0],
    });
    return (
      <View style={styles.container}>
        <Animated.View style={[screenStyle, { transform: [{ translateX: outgoingTranslate }] }]}>
          {renderScreen(OutgoingComponent, transition.outgoingEntry)}
        </Animated.View>
        <Animated.View style={[screenStyle, { transform: [{ translateX: incomingTranslate }] }]}>
          {renderScreen(ScreenComponent, current)}
        </Animated.View>
      </View>
    );
  }

  // Pop
  const outgoingTranslate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });
  const incomingTranslate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.3, 0],
  });
  return (
    <View style={styles.container}>
      <Animated.View style={[screenStyle, { transform: [{ translateX: incomingTranslate }] }]}>
        {renderScreen(ScreenComponent, current)}
      </Animated.View>
      <Animated.View style={[screenStyle, { transform: [{ translateX: outgoingTranslate }] }]}>
        {renderScreen(OutgoingComponent, transition.outgoingEntry)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
  },
});
