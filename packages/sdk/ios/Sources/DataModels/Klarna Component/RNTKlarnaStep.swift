//
//  RNTKlarnaStep.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 03.04.2024.
//

import Foundation
import PrimerSDK

protocol KlarnaStepRN {
    var stepName: String { get }
}

/// Session creation
class PaymentSessionCreatedRN: KlarnaStepRN, Encodable {
    var stepName: String = "paymentSessionCreated"
    var _jdasdkladklasjdaslkdjaslkdjasldkasjdlkasjdaslkdjaslkdjasldkajsdlkasjdlaksdjaslkdjasldkjasldkjasdlkasjdlaksjdlaskjdalsk: String = "paymentSessionCreated"
    var paymentCategories: [KlarnaPaymentCategoryRN]

    init(paymentCategories: [KlarnaPaymentCategory]) {self.paymentCategories = paymentCategories.map { $0.toKlarnaPaymentCategoryRN() }}
}

/// Session authorization
class PaymentSessionAuthorizedRN: KlarnaStepRN, Encodable {
    var stepName: String = "paymentSessionAuthorized"
    var isFinalized: Bool

    init(isFinalized: Bool) {
        self.isFinalized = isFinalized
    }
}

/// Session finalization
class PaymentSessionFinalizedRN: KlarnaStepRN, Encodable {
    var stepName: String = "paymentSessionFinalized"
}

/// Payment view loaded
class PaymentViewLoadedRN: KlarnaStepRN, Encodable {
    var stepName: String = "paymentViewLoaded"
}

extension KlarnaStep {
    func toPaymentSessionCreatedRN(categories: [KlarnaPaymentCategory]) -> PaymentSessionCreatedRN {
        return PaymentSessionCreatedRN(paymentCategories: categories)
    }

    func toPaymentSessionAuthorizedRN(isFinalized: Bool) -> PaymentSessionAuthorizedRN {
        return PaymentSessionAuthorizedRN(isFinalized: isFinalized)
    }

    func toPaymentSessionFinalizedRN() -> PaymentSessionFinalizedRN {
        return PaymentSessionFinalizedRN()
    }

    func toPaymentViewLoadedRN() -> PaymentViewLoadedRN {
        return PaymentViewLoadedRN()
    }
}
