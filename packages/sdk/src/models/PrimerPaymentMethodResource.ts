export interface IPrimerPaymentMethodResource {
    paymentMethodType: string;
    paymentMethodName: string;
    nativeViewName?: string;
}

export interface PrimerPaymentMethodAsset extends IPrimerPaymentMethodResource {
    paymentMethodLogo: IPrimerAsset
    paymentMethodBackgroundColor: IPrimerAsset
    nativeViewName?: undefined
}

export interface PrimerPaymentMethodNativeView extends IPrimerPaymentMethodResource {
    nativeViewName: string
}

export interface IPrimerAsset {
    colored?: string;
    dark?: string;
    light?: string;
}