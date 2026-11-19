import type { PrimerClientSession } from '../../models/PrimerClientSession';

const SURCHARGE_FEE_TYPE = 'SURCHARGE';

export function orderTotal(clientSession: PrimerClientSession | null) {
  if (clientSession?.totalAmount == null) return undefined;
  const surcharge = (clientSession.fees ?? [])
    .filter((fee) => fee.type === SURCHARGE_FEE_TYPE)
    .reduce((sum, fee) => sum + fee.amount, 0);
  return clientSession.totalAmount - surcharge;
}
