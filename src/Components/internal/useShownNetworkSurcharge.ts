import { usePrimerCheckout } from '../hooks/usePrimerCheckout';
import { usePrimerCardNetworkSelection } from '../hooks/usePrimerCardNetworkSelection';
import { useCardFormStateContext } from './form-state/CardFormStateProvider';
import { usePrimerLocalization } from './localization';

const PAYMENT_CARD_TYPE = 'PAYMENT_CARD';

export interface ShownNetworkSurcharge {
  surchargeAmountRaw?: number;
  surchargeAmount?: string;
}

export function useShownNetworkSurcharge(): ShownNetworkSurcharge {
  const { clientSession, cardFormState } = usePrimerCheckout();
  const { displayedIdentifier, isSelectorVisible, isDualBadge } = usePrimerCardNetworkSelection();
  const cardNumber = useCardFormStateContext()?.cardNumber;
  const { formatCurrency } = usePrimerLocalization();

  const network = isSelectorVisible || isDualBadge ? displayedIdentifier : cardFormState.binData?.preferred?.network;
  const amount =
    network && cardNumber
      ? clientSession?.paymentMethodOptions?.[PAYMENT_CARD_TYPE]?.networks?.[network]?.surcharge?.amount
      : undefined;
  const currencyCode = clientSession?.currencyCode;
  if (amount == null || amount <= 0 || !currencyCode) return {};
  return { surchargeAmountRaw: amount, surchargeAmount: `+ ${formatCurrency(amount, currencyCode)}` };
}
