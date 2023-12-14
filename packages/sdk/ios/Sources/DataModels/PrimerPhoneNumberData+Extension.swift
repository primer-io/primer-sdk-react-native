//
//  RNTPrimerPhoneNumberData.swift
//  primer-io-react-native
//
//  Created by Dario Carlomagno on 18/8/22.
//

import Foundation
import PrimerSDK

extension PrimerPhoneNumberData {

    convenience init?(phoneNumbeDatarStr: String) {
        do {
            guard let data = phoneNumbeDatarStr.data(using: .utf8) else {
                return nil
            }

            let json = try JSONSerialization.jsonObject(with: data)

            guard let dict = json as? [String: String] else {
                return nil
            }

            if let phoneNumber = dict["phoneNumber"]
            {
                self.init(
                    phoneNumber: phoneNumber)
            } else {
                return nil
            }

        } catch {
            return nil
        }
    }
}
