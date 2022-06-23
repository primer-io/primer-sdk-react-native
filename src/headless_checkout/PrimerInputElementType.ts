export enum PrimerInputElementType {
    CardNumber = 0,
    ExpiryDate,
    CVV,
    CardholderName,
    OTP,
    PostalCode,
    Unknown
}

export function getPrimerInputElementTypeStringVal(primerInputElementType: PrimerInputElementType): string {
    switch (primerInputElementType) {
        case PrimerInputElementType.CardNumber:
            return "CardNumber";
        case PrimerInputElementType.ExpiryDate:
            return "ExpiryDate";
        case PrimerInputElementType.CVV:
            return "CVV";
        case PrimerInputElementType.CardholderName:
            return "CardholderName";
        case PrimerInputElementType.OTP:
            return "OTP";
        case PrimerInputElementType.PostalCode:
            return "PostalCode";
        case PrimerInputElementType.Unknown:
            return "Unknown";
    }
}

export function makePrimerInputElementTypeFromStringVal(primerInputElementTypeStr: string): PrimerInputElementType | null {
    switch (primerInputElementTypeStr.toLowerCase()) {
        case "cardnumber":
            return PrimerInputElementType.CardNumber;
        case "expirydate":
            return PrimerInputElementType.ExpiryDate;
        case "cvv":
            return PrimerInputElementType.CVV;
        case "cardholdername":
            return PrimerInputElementType.CardholderName;
        case "otp":
            return PrimerInputElementType.OTP;
        case "postalcode":
            return PrimerInputElementType.PostalCode;
        case "unknown":
            return PrimerInputElementType.Unknown;
    }

    return null;
}
