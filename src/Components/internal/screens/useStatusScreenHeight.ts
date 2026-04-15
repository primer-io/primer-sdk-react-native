import { useEffect } from 'react';
import { useSheetHeight } from '../checkout-sheet';

export function useStatusScreenHeight(height: number) {
  const { setHeight, resetHeight } = useSheetHeight();

  useEffect(() => {
    setHeight(height);
    return resetHeight;
  }, [height, setHeight, resetHeight]);
}
