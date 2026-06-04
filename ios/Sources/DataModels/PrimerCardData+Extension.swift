//
//  RNTPrimerCardData.swift
//  primer-io-react-native
//
//  Created by Evangelos on 3/8/22.
//

import Foundation
import PrimerSDK

extension PrimerCardData {

    convenience init?(cardDataStr: String) {
        do {
            guard let data = cardDataStr.data(using: .utf8) else {
                return nil
            }

            let json = try JSONSerialization.jsonObject(with: data)

            guard let dict = json as? [String: String] else {
                return nil
            }

            if let cardNumber = dict["cardNumber"],
               let cvv = dict["cvv"],
               let expiryDate = dict["expiryDate"] {
                let cardholderName = dict["cardholderName"]
                // Optional co-badge pick from JS; unknown identifiers are ignored.
                var cardNetwork: CardNetwork?
                if let networkIdentifier = dict["cardNetwork"],
                   let network = CardNetwork(rawValue: networkIdentifier),
                   network != .unknown {
                    cardNetwork = network
                }
                self.init(
                    cardNumber: cardNumber,
                    expiryDate: expiryDate,
                    cvv: cvv,
                    cardholderName: cardholderName,
                    cardNetwork: cardNetwork)
            } else {
                return nil
            }

        } catch {
            return nil
        }
    }
}
