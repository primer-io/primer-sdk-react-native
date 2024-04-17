//
//  PrimerCheckoutPaymentMethodData+RN.swift
//  primer-io-react-native
//
//  Created by Niall Quinn on 19/03/24.
//

import Foundation
import PrimerSDK

extension PrimerCheckoutPaymentMethodData {
    func toPrimerCheckoutPaymentMethodDataRN() -> PrimerCheckoutPaymentMethodDataRN {
        PrimerCheckoutPaymentMethodDataRN(paymentMethodType: self.paymentMethodType.type)
    }
}

struct PrimerCheckoutPaymentMethodDataRN: Codable {
    let paymentMethodType: String
}
