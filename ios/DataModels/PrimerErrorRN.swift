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
}

struct ErrorRN: Error {
    let message: String
}
