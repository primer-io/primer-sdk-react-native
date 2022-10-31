export interface PrimerRawData {}

export interface PrimerRawCardData extends PrimerRawData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName?: string;
}

export interface PrimerRawPhoneNumberData extends PrimerRawData {
    phoneNumber: string;
}

export interface PrimerRawCardRedirectData extends PrimerRawData {}

export interface PrimerRawBancontactCardRedirectData extends PrimerRawCardRedirectData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
}

export interface PrimerRawRetailerData extends PrimerRawData {
    id: string;
}
