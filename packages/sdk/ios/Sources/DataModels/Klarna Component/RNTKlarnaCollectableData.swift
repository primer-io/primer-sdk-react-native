//
//  RNTKlarnaCollectableData.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 03.04.2024.
//

import Foundation
import PrimerSDK

protocol KlarnaCollectableDataRN {
    var validatableDataName: String { get }
}

class KlarnaPaymentOptionsRN: KlarnaCollectableDataRN, Encodable {
    var validatableDataName: String = "klarnaPaymentOptions"
    var paymentCategory: KlarnaPaymentCategoryRN
    
    init(paymentCategory: KlarnaPaymentCategory) {
        self.paymentCategory = paymentCategory.toKlarnaPaymentCategoryRN()
    }
}

class FinalizePaymentRN: KlarnaCollectableDataRN, Encodable {
    var validatableDataName: String = "klarnaPaymentFinalization"
}

extension KlarnaCollectableData {
    func toKlarnaPaymentOptionsRN(category: KlarnaPaymentCategory) -> KlarnaPaymentOptionsRN {
        return KlarnaPaymentOptionsRN(paymentCategory: category)
    }
    
    func toFinalizePaymentRN() -> FinalizePaymentRN {
        return FinalizePaymentRN()
    }
}
