//
//  Encodable+Extension.swift
//  primer-io-react-native
//
//  Created by Evangelos on 7/10/22.
//

import Foundation

extension Encodable {
    
    func toJsonObject() throws -> Any {
        let data = try JSONEncoder().encode(self)
        let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
        return json
    }
}

extension Decodable {
    /// Initialize an object from a JSON string.
    /// - Parameter jsonString: A string representation of the JSON.
    /// - Throws: An error if the decoding fails.
    /// - Returns: An initialized object conforming to the Decodable protocol.
    static func from(jsonString: String) throws -> Self {
        guard let data = jsonString.data(using: .utf8) else {
            throw NSError(domain: "String could not be converted to UTF-8 data.", code: 0, userInfo: [NSLocalizedDescriptionKey: "String could not be converted to UTF-8 data."])
        }
        return try JSONDecoder().decode(Self.self, from: data)
    } 
}