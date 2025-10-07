import Foundation
import PrimerSDK

extension PrimerBancontactCardData {

    convenience init?(bankcontactCardDataStr: String) {
        do {
            guard let data = bankcontactCardDataStr.data(using: .utf8) else {
                return nil
            }

            let json = try JSONSerialization.jsonObject(with: data)

            guard let dict = json as? [String: String] else {
                return nil
            }

            if let cardNumber = dict["cardNumber"],
               let expiryDate = dict["expiryDate"],
               let cardholderName = dict["cardholderName"] {
                self.init(
                    cardNumber: cardNumber,
                    expiryDate: expiryDate,
                    cardholderName: cardholderName)
            } else {
                return nil
            }

        } catch {
            return nil
        }
    }
}
