import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Returns the keyboard height in dp, or 0 when the keyboard is hidden.
// Used by screens to drive a manual `paddingBottom` instead of relying on
// `KeyboardAvoidingView`, which is unreliable inside a Modal on Android and
// gets thrown off on iOS when an empty InputAccessoryView is present.
export function useKeyboardPadding(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setHeight(e.endCoordinates.height);
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
