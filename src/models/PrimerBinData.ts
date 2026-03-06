export type PrimerBinDataStatus = 'PARTIAL' | 'COMPLETE';

export interface PrimerCardNetwork {
  displayName: string;
  network: string;
  // Only provided by iOS — computed from merchant-allowed networks configuration
  allowed?: boolean;
  // Enriched fields — populated only when status is 'COMPLETE' (8+ digits, successful API response)
  issuerCountryCode?: string | null;
  issuerName?: string | null;
  accountFundingType?: string | null;
  prepaidReloadableIndicator?: string | null;
  productUsageType?: string | null;
  productCode?: string | null;
  productName?: string | null;
  issuerCurrencyCode?: string | null;
  regionalRestriction?: string | null;
  accountNumberType?: string | null;
}

export interface PrimerBinData {
  // First network allowed by merchant config; null when status is PARTIAL
  preferred: PrimerCardNetwork | null;
  // Other detected networks (e.g. co-badged cards like Visa + Cartes Bancaires)
  alternatives: PrimerCardNetwork[];
  status: PrimerBinDataStatus;
  firstDigits: string | null;
}
