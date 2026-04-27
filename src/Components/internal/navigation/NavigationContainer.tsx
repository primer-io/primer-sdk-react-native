import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
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

  // Always render the current screen inside a stable Animated.View wrapper keyed by its route.
  // The outgoing screen is rendered as a sibling only during transitions. Consequence: the
  // current screen's component instance is preserved across transition start/end — no remount,
  // no useEffect re-runs caused by the container swapping tree shapes.
  const bg = { backgroundColor: tokens.colors.background };
  const currentZIndex = transition.type === 'pop' ? 1 : 2;
  const outgoingZIndex = transition.type === 'pop' ? 2 : 1;
  const showOutgoing = transition.type !== 'none' && !!OutgoingComponent && !!transition.outgoingEntry;

  return (
    <View style={styles.container}>
      <Animated.View
        key={`screen-${current.key}`}
        style={[styles.screen, bg, { zIndex: currentZIndex }, renderCurrentAnim(transition.type, animValue, width)]}
      >
        <RouteEntryContext.Provider value={current}>
          <ScreenComponent />
        </RouteEntryContext.Provider>
      </Animated.View>
      {showOutgoing && OutgoingComponent && transition.outgoingEntry && (
        <Animated.View
          key={`screen-${transition.outgoingEntry.key}`}
          style={[styles.screen, bg, { zIndex: outgoingZIndex }, renderOutgoingAnim(transition.type, animValue, width)]}
        >
          <RouteEntryContext.Provider value={transition.outgoingEntry}>
            <OutgoingComponent />
          </RouteEntryContext.Provider>
        </Animated.View>
      )}
    </View>
  );
}

// Animated styles use the Animated.View's style prop type, which is wider than the
// static StyleProp<ViewStyle>. Returning `Animated.WithAnimatedValue<ViewStyle>`
// keeps full type safety without resorting to `any`.
function renderCurrentAnim(
  type: TransitionType,
  animValue: Animated.Value,
  width: number
): Animated.WithAnimatedValue<ViewStyle> | null {
  switch (type) {
    case 'replace':
      return { opacity: animValue };
    case 'push':
      return {
        transform: [{ translateX: animValue.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }],
      };
    case 'pop':
      return {
        transform: [{ translateX: animValue.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.3, 0] }) }],
      };
    case 'none':
    default:
      return null;
  }
}

function renderOutgoingAnim(
  type: TransitionType,
  animValue: Animated.Value,
  width: number
): Animated.WithAnimatedValue<ViewStyle> | null {
  switch (type) {
    case 'replace':
      return { opacity: Animated.subtract(1, animValue) };
    case 'push':
      return {
        transform: [{ translateX: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, -width * 0.3] }) }],
      };
    case 'pop':
      return {
        transform: [{ translateX: animValue.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }],
      };
    case 'none':
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
  },
});
