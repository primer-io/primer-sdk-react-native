export type PrimerCheckoutPaymentMethodData = IPrimerCheckoutPaymentMethodData;

interface IPrimerCheckoutPaymentMethodData {
    /**
    * @deprecated The method should not be used
    */
    paymentMethodType: string;
    
    paymentMethod: string;
}