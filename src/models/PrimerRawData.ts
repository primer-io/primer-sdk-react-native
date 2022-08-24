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
