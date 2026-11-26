import type { PaymentMethodItem, PaymentMethodSurcharge } from '../types/PaymentMethodTypes';

export type SurchargeGroupTitle = number | 'none' | 'mayApply';

function surchargeTitle(
  surcharge: PaymentMethodSurcharge | undefined,
  allowedCardNetworks: readonly string[]
): SurchargeGroupTitle {
  if (surcharge?.kind !== 'perNetwork') {
    const amount = surcharge?.amount ?? 0;
    return amount > 0 ? amount : 'none';
  }
  if (!Object.values(surcharge.amounts).some((amount) => amount > 0)) return 'none';
  const fees = new Set(allowedCardNetworks.map((network) => Math.max(surcharge.amounts[network] ?? 0, 0)));
  const fee = fees.size === 1 ? fees.values().next().value : undefined;
  if (fee == null) return 'mayApply';
  return fee > 0 ? fee : 'none';
}

export function groupBySurcharge(methods: PaymentMethodItem[], allowedCardNetworks: readonly string[]) {
  const titles = methods.map((method) => surchargeTitle(method.surcharge, allowedCardNetworks));
  if (titles.every((title) => title === 'none')) return [];
  const feeTitles = [...new Set(titles.filter((title) => typeof title === 'number'))];
  return [...feeTitles, 'none' as const, 'mayApply' as const]
    .map((title) => ({ title, methods: methods.filter((_, index) => titles[index] === title) }))
    .filter((group) => group.methods.length > 0);
}
