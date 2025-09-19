//
//  PrimerHeadlessUniversalCheckoutComponentEvent.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 01.04.2024.
//

import Foundation

// swiftlint:disable type_name
@objc
enum PrimerHeadlessUniversalCheckoutComponentEvent: Int, CaseIterable {
    // swiftlint:enable type_name

    case onStep
    case onError
    case onValid
    case onInvalid
    case onValidating
    case onValidationError

    var stringValue: String {
        switch self {
        case .onStep:
            return "onStep"
        case .onError:
            return "onError"
        case .onValid:
            return "onValid"
        case .onInvalid:
            return "onInvalid"
        case .onValidating:
            return "onValidating"
        case .onValidationError:
            return "onValidationError"
        }
    }
}
