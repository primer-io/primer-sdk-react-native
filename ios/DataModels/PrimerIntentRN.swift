import PrimerSDK

struct PrimerIntentRN: Decodable {
    let vault: Bool
    let paymentMethod: String
    
    var paymentMethodConfigType: PaymentMethodConfigType {
        PaymentMethodConfigType.init(rawValue: paymentMethod)
    }
}
