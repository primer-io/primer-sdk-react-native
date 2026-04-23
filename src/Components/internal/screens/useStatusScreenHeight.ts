import { useEffect } from 'react';
import { useSheetHeight } from '../checkout-sheet';

export function useStatusScreenHeight(height: number) {
  const { setHeight } = useSheetHeight();

  useEffect(() => {
    setHeight(height);
  }, [height, setHeight]);
}
