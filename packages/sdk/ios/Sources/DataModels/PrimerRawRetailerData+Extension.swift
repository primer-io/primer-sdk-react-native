//
//  RNTPrimerPhoneNumberData.swift
//  primer-io-react-native
//
//  Created by Dario Carlomagno on 19/10/22.
//

import Foundation
import PrimerSDK

extension PrimerRetailerData {

    convenience init?(primerRetailerDataStr: String) {
        do {
            guard let data = primerRetailerDataStr.data(using: .utf8) else {
                return nil
            }

            let json = try JSONSerialization.jsonObject(with: data)

            guard let dict = json as? [String: String] else {
                return nil
            }

            if let retailerId = dict["id"]
            {
                self.init(
                    id: retailerId)
            } else {
                return nil
            }

        } catch {
            return nil
        }
    }
}
