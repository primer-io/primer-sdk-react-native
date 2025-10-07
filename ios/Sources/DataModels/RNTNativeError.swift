import Foundation

struct RNTNativeError: CustomNSError, LocalizedError, Codable {

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
