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
               let expiryMonth = dict["expiryMonth"],
               let expiryYear = dict["expiryYear"]
            {
                let cardholderName = dict["cardholderName"]
                self.init(
                    cardNumber: cardNumber,
                    expiryMonth: expiryMonth,
                    expiryYear: expiryYear,
                    cvv: cvv,
                    cardholderName: cardholderName)
            } else {
                return nil
            }
            
        } catch {
            return nil
        }
    }
    
}
