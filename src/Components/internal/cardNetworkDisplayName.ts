const CARD_NETWORK_DISPLAY_NAMES: Record<string, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  DINERS_CLUB: 'Diners Club',
  DISCOVER: 'Discover',
  JCB: 'JCB',
  UNIONPAY: 'UnionPay',
  MAESTRO: 'Maestro',
  ELO: 'Elo',
  MIR: 'Mir',
  HIPER: 'Hiper',
  HIPERCARD: 'Hipercard',
  DANKORT: 'Dankort',
  BANCONTACT: 'Bancontact',
  CARTES_BANCAIRES: 'Cartes Bancaires',
  EFTPOS: 'EFTPOS',
};

export function getCardNetworkDisplayName(network: string | undefined): string | undefined {
  return CARD_NETWORK_DISPLAY_NAMES[network?.toUpperCase() ?? ''];
}
