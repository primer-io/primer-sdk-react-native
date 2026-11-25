//
//  PrimerAddress+Extension.swift
//  primer-io-react-native
//

import Foundation
import PrimerSDK

extension PrimerAddress {

    convenience init?(billingAddressStr: String) {
        guard
            let data = billingAddressStr.data(using: .utf8),
            let json = try? JSONSerialization.jsonObject(with: data),
            let dict = json as? [String: Any]
        else {
            return nil
        }

        let stringValue: (String) -> String? = { key in
            dict[key] as? String
        }

        self.init(
            firstName: stringValue("firstName"),
            lastName: stringValue("lastName"),
            addressLine1: stringValue("addressLine1"),
            addressLine2: stringValue("addressLine2"),
            postalCode: stringValue("postalCode"),
            city: stringValue("city"),
            state: stringValue("state"),
            countryCode: stringValue("countryCode")
        )
    }
}
