import Foundation
import PrimerSDK

extension PrimerBancontactCardRedirectData {

    convenience init?(cardRedirectDataStr: String) {
        do {
            guard let data = cardRedirectDataStr.data(using: .utf8) else {
                return nil
            }

            let json = try JSONSerialization.jsonObject(with: data)

            guard let dict = json as? [String: String] else {
                return nil
            }

            if let cardNumber = dict["cardNumber"],
               let expiryMonth = dict["expiryMonth"],
               let expiryYear = dict["expiryYear"],
               let cardholderName = dict["cardholderName"]
            {
                self.init(
                    cardNumber: cardNumber,
                    expiryMonth: expiryMonth,
                    expiryYear: expiryYear,
                    cardholderName: cardholderName)
            } else {
                return nil
            }

        } catch {
            return nil
        }
    }

}
