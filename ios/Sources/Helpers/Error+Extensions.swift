//
//  Error+Extensions.swift
//  primer-io-react-native
//
//  Created by Evangelos on 7/10/22.
//

import Foundation

internal extension Error {
    var rnError: [String: String] {
        var json: [String: String] = [
            "errorId": (self as NSError).domain,
            "description": localizedDescription
        ]
        
        if let key = (self as NSError).userInfo["key"] as? String {
            json["key"] = key
        }
        
        if let recoverySuggestion = (self as NSError).localizedRecoverySuggestion {
            json["recoverySuggestion"] = recoverySuggestion
        }

        return json
    }
}
