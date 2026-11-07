import type { PrimerSettings } from '../../models/PrimerSettings';

type CardFormUIOptions = NonNullable<NonNullable<PrimerSettings['uiOptions']>['cardFormUIOptions']>;

export function payButtonTitle(
  options: CardFormUIOptions | undefined,
  formattedAmount: string | undefined,
  defaultTitle: string,
  defaultTitleWithAmount: (amount: string) => string
): string {
  const customText = options?.payButtonText?.trim();
  const amount = options?.payButtonAmountVisible ? formattedAmount : undefined;
  if (!amount) return customText || defaultTitle;
  return customText ? `${customText} ${amount}` : defaultTitleWithAmount(amount);
}
