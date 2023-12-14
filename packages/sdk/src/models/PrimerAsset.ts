export interface IPrimerAsset {
    paymentMethodType: string;
    paymentMethodName: string;
    paymentMethodLogo: {
        colored?: string;
        dark?: string;
        light?: string;
    }
    paymentMethodBackgroundColor: {
        colored?: string;
        dark?: string;
        light?: string;
    }
}