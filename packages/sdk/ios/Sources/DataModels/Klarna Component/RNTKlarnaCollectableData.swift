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

class PaymentCategoryRN: KlarnaCollectableDataRN, Encodable {
    var validatableDataName: String = "klarnaPaymentOptions"
    var paymentCategory: KlarnaPaymentCategory
    
    init(paymentCategory: KlarnaPaymentCategory) {
        self.paymentCategory = paymentCategory
    }
}

class FinalizePaymentRN: KlarnaCollectableDataRN, Encodable {
    var validatableDataName: String = "klarnaPaymentFinalization"
}

extension KlarnaCollectableData {
    func toPaymentCategoryRN(category: KlarnaPaymentCategory) -> PaymentCategoryRN {
        return PaymentCategoryRN(paymentCategory: category)
    }
    
    func toFinalizePaymentRN() -> FinalizePaymentRN {
        return FinalizePaymentRN()
    }
}
