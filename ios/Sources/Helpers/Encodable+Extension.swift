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
