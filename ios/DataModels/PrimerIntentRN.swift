import PrimerSDK

struct PrimerIntentRN: Decodable {
    let vault: Bool
    let paymentMethod: PrimerPaymentMethodTypeRN
    
    
    func toPrimerSessionFlow() -> PrimerSessionFlow? {
        
        switch (vault) {
        case false:
            switch (paymentMethod) {
            case .Any:
                return .default
            case .ApplePay:
                return .checkoutWithApplePay
            case .Klarna:
                return .checkoutWithKlarna
            case .Card:
                return .completeDirectCheckout
            default:
                return nil
            }
        case true:
            switch (paymentMethod) {
            case .Any:
                return .defaultWithVault
            case .Klarna:
                return .addKlarnaToVault
            case .PayPal:
                return .addPayPalToVault
            case .Card:
                return .defaultWithVault
            default:
                return nil
            }
        }
    }
}

enum PrimerPaymentMethodTypeRN: String, Decodable {
    case `Any`, Klarna, Card, PayPal, GooglePay, ApplePay, GoCardless
}
