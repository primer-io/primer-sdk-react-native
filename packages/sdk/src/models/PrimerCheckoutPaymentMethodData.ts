export type PrimerCheckoutPaymentMethodData = IPrimerCheckoutPaymentMethodData;

interface IPrimerCheckoutPaymentMethodData {
    /*
    * @deprecated use paymentMethod field instead
    */
    paymentMethodType: string;
    
    paymentMethod: string;
}
