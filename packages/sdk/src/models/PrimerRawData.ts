export interface PrimerRawData {}

export interface PrimerCardData extends PrimerRawData {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName?: string;
}

export interface PrimerPhoneNumberData extends PrimerRawData {
    phoneNumber: string;
}

export interface PrimerBancontactCardData extends PrimerRawData {
    cardNumber: string;
    expiryDate: string;
    cardholderName: string;
}

export interface PrimerRetailerData extends PrimerRawData {
    id: string;
}
