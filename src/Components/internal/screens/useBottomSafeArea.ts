import { useEffect, useState } from 'react';
import NativePrimerViewUtils from '../../../specs/NativePrimerViewUtils';

export function useBottomSafeArea(): number {
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    NativePrimerViewUtils?.getBottomSafeAreaInset()
      .then(setBottomInset)
      .catch(() => {});
  }, []);

  return bottomInset;
}
