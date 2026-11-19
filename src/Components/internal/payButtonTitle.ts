const AMOUNT_TOKEN = '{amount}';

export function payButtonTitle(
  payButtonText: string | undefined,
  formattedAmount: string | undefined,
  defaultTitle: string
): string {
  const text = payButtonText?.trim();
  if (!text) return defaultTitle;
  if (!text.includes(AMOUNT_TOKEN)) return text;
  if (formattedAmount !== undefined) return text.split(AMOUNT_TOKEN).join(formattedAmount);
  const withoutAmount = text.split(AMOUNT_TOKEN).join('').replace(/ {2,}/g, ' ').trim();
  return withoutAmount || defaultTitle;
}
