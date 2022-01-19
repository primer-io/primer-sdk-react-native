import PrimerSDK

struct PrimerIntentRN: Decodable {
    let vault: Bool
    let paymentMethod: String
    
    var paymentMethodConfigType: PaymentMethodConfigType {
        switch paymentMethod {
        case "ADYEN_ALIPAY":
            return .adyenAlipay
        case "ADYEN_DOTPAY":
            return .adyenDotPay
        case "ADYEN_GIROPAY":
            return .adyenGiropay
        case "ADYEN_IDEAL":
            return .adyenIDeal
        case "ADYEN_MOBILEPAY":
            return .adyenMobilePay
        case "ADYEN_SOFORT":
            return .adyenSofort
        case "ADYEN_TRUSTLY":
            return .adyenTrustly
        case "ADYEN_TWINT":
            return .adyenTwint
        case "ADYEN_VIPPS":
            return .adyenVipps
        case "APAYA":
            return .apaya
        case "APPLE_PAY":
            return .applePay
        case "ATOME":
            return .atome
        case "BUCKAROO_BANCONTACT":
            return .buckarooBancontact
        case "BUCKAROO_EPS":
            return .buckarooEps
        case "BUCKAROO_GIROPAY":
            return .buckarooGiropay
        case "BUCKAROO_IDEAL":
            return .buckarooIdeal
        case "BUCKAROO_SOFORT":
            return .buckarooSofort
        case "GOCARDLESS":
            return .goCardlessMandate
        case "GOOGLE_PAY":
            return .googlePay
        case "HOOLAH":
            return .hoolah
        case "KLARNA":
            return .klarna
        case "MOLLIE_BANCONTACT":
            return .mollieBankcontact
        case "MOLLIE_IDEAL":
            return .mollieIdeal
        case "PAY_NL_BANCONTACT":
            return .payNLBancontact
        case "PAY_NL_GIROPAY":
            return .payNLGiropay
        case "PAY_NL_IDEAL":
            return .payNLIdeal
        case "PAY_NL_PAYCONIQ":
            return .payNLPayconiq
        case "PAYMENT_CARD":
            return .paymentCard
        case "PAYPAL":
            return .payPal
        default:
            return .other(rawValue: paymentMethod)
        }
    }
}
