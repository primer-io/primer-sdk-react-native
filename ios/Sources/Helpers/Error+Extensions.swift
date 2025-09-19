//
//  Error+Extensions.swift
//  primer-io-react-native
//
//  Created by Evangelos on 7/10/22.
//

import Foundation
import PrimerSDK

internal extension Error {
    var rnError: [String: String] {
        var json: [String: String] = [
            "description": localizedDescription
        ]

        if let primerValidationErr = self as? PrimerValidationError {
            json["errorId"] = primerValidationErr.errorId
            json["diagnosticsId"] = primerValidationErr.diagnosticsId

        } else if let primerErr = self as? PrimerError {
            json["errorId"] = primerErr.errorId
            json["diagnosticsId"] = primerErr.diagnosticsId

        } else {
            json["errorId"] = (self as NSError).domain
        }

        if let inputElementType = (self as NSError).userInfo["inputElementType"] as? String {
            json["inputElementType"] = inputElementType
        }

        if let recoverySuggestion = (self as NSError).localizedRecoverySuggestion {
            json["recoverySuggestion"] = recoverySuggestion
        }

        return json
    }
}
