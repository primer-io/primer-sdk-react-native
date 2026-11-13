import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Cached so callers can estimate the height before `keyboardWillShow` fires (e.g. when
// auto-focusing a field). Default is a typical iPhone portrait keyboard.
let lastSeenKeyboardHeight = 290;

export function getLastSeenKeyboardHeight(): number {
  return lastSeenKeyboardHeight;
}

export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates?.height ?? 0;
      lastSeenKeyboardHeight = h;
      setHeight(h);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
