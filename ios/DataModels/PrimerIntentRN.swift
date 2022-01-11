import PrimerSDK

struct PrimerIntentRN: Decodable {
    let vault: Bool
    let paymentMethod: PrimerPaymentMethodTypeRN
    
    var paymentMethodConfigType: PaymentMethodConfigType {
        switch paymentMethod {
        case .Any:
            return .paymentCard
        case .Klarna:
            return .klarna
        case .Card:
            return .paymentCard
        case .PayPal:
            return .payPal
        case .GooglePay:
            return .googlePay
        case .ApplePay:
            return .applePay
        case .GoCardless:
            return .goCardlessMandate
        }
    }
}

enum PrimerPaymentMethodTypeRN: String, Decodable {
    case `Any`, Klarna, Card, PayPal, GooglePay, ApplePay, GoCardless
}
