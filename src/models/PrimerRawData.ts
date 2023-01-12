export interface PrimerRawData {}

export interface PrimerCardData extends PrimerRawData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName?: string;
}

export interface PrimerPhoneNumberData extends PrimerRawData {
    phoneNumber: string;
}

export interface PrimerCardRedirectData extends PrimerRawData {}

export interface PrimerBancontactCardRedirectData extends PrimerCardRedirectData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
}

export interface PrimerRetailerData extends PrimerRawData {
    id: string;
}
