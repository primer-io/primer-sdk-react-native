struct PrimerErrorRN: Encodable {
    let exceptionType: ErrorTypeRN
    let description: String?
}

enum ErrorTypeRN: String, Error, Encodable {
    case ParseJsonFailed
    case noIosViewController
    case invalidPrimerIntent
    case themeParsingFailed
    case settingsParsingFailed
    case settingsNotConfigured
    case clientTokenNotConfigured
    case flowParsingFailed
    case generic
}

struct NativeError: CustomNSError, LocalizedError {
    let errorId: String
    let errorDescription: String?
    let recoverySuggestion: String?
    
    var rnError: [String: String] {
        var json: [String: String] = [
            "errorId": errorId,
            "description": errorDescription ?? "Something went wrong"
        ]
        
        if let recoverySuggestion = recoverySuggestion {
            json["recoverySuggestion"] = recoverySuggestion
        }

        return json
    }
}

internal extension Error {
    var rnError: [String: String] {
        var json: [String: String] = [
            "errorId": (self as NSError).domain,
            "description": localizedDescription
        ]
        
        if let recoverySuggestion = (self as NSError).localizedRecoverySuggestion {
            json["recoverySuggestion"] = recoverySuggestion
        }

        return json
    }
}
