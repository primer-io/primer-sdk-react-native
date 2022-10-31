//
//  PrimerHeadlessUniversalCheckout_PaymentMethod.swift
//  primer-io-react-native
//
//  Created by Evangelos on 7/10/22.
//

import Foundation
import PrimerSDK

extension PrimerHeadlessUniversalCheckout.PaymentMethod {
    
    func toJsonObject() -> [String: Any] {
        return [
            "paymentMethodType": paymentMethodType,
            "supportedPrimerSessionIntents": self.supportedPrimerSessionIntents.compactMap({ $0.rawValue }),
<<<<<<< HEAD
            "paymentMethodManagerCategories": self.paymentMethodManagerCategories.compactMap({ $0.rawValue })
=======
            "paymentMethodManagerCategories": self.paymentMethodManagerCategories.compactMap({ $0.rawValue }).filter({ $0 != "CARD_COMPONENTS" })
>>>>>>> feature/DEVX-409_HUC-Example-app
        ]
    }
}
