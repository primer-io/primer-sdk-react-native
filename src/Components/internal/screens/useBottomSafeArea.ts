import { useEffect, useState } from 'react';
import NativePrimerViewUtils from '../../../specs/NativePrimerViewUtils';

export function useBottomSafeArea(): number {
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    let mounted = true;
    NativePrimerViewUtils?.getBottomSafeAreaInset()
      .then((value) => {
        if (mounted) setBottomInset(value);
      })
      .catch((e) => {
        if (__DEV__) console.warn('getBottomSafeAreaInset failed', e);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return bottomInset;
}
