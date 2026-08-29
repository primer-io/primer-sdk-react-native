import { useEffect } from 'react';
import { useSheetHeight } from '../checkout-sheet';

export function useStatusScreenHeight(height: number) {
  const { requestHeight } = useSheetHeight();

  useEffect(() => {
    const release = requestHeight(height);
    return release;
  }, [height, requestHeight]);
}
