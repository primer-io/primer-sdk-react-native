//
//  RNTPrimerError.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 03.04.2024.
//

import Foundation
import PrimerSDK

struct PrimerErrorRN: Encodable {
    var errorId: String?
    var errorCode: Int?
    var description: String?
    var diagnosticsId: String?
    var recoverySuggestion: String?

    init(
        errorId: String? = nil,
        errorCode: Int? = nil,
        description: String? = nil,
        diagnosticsId: String? = nil,
        recoverySuggestion: String? = nil
    ) {
        self.errorId = errorId
        self.errorCode = errorCode
        self.description = description
        self.diagnosticsId = diagnosticsId
        self.recoverySuggestion = recoverySuggestion
    }
}

struct PrimerValidationErrorRN: Encodable {
    var errorId: String?
    var description: String?
    var diagnosticsId: String?
    var dummyPropertyHJDKASHDKJASDHKASJDHASKJDHASKDJHASDKAJSHDKSAJHDKSAJHDSAKJDHASKDJHSAKDJSAHDKAJSHDKASJDHASKJDHASKDJAHSDKJASHDKJASHSAKJH: String?

    init(errorId: String? = nil,
         description: String? = nil,
         diagnosticsId: String? = nil
    ) {
        self.errorId = errorId
        self.description = description
        self.diagnosticsId = diagnosticsId
    }
}

extension PrimerError {
    func toPrimerErrorRN() -> PrimerErrorRN {
        return PrimerErrorRN(
            errorId: self.errorId,
            errorCode: self.errorCode,
            description: self.errorDescription,
            diagnosticsId: self.diagnosticsId,
            recoverySuggestion: self.recoverySuggestion
        )
    }
}

extension PrimerValidationError {
    func toPrimerValidationErrorRN() -> PrimerValidationErrorRN {
        return PrimerValidationErrorRN(errorId: self.errorId,
                                       description: self.errorDescription,
                                       diagnosticsId: self.diagnosticsId
        )
    }
}
