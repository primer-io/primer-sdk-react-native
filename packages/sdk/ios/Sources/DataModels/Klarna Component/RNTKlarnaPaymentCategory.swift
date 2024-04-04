//
//  RNTKlarnaPaymentCategory.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 03.04.2024.
//

import Foundation

@objc
class KlarnaPaymentCategoryRN: NSObject, Codable {
    var identifier: String
    var name: String
    var descriptiveAssetUrl: String
    var standardAssetUrl: String
    
    init(identifier: String, name: String, descriptiveAssetUrl: String, standardAssetUrl: String) {
        self.identifier = identifier
        self.name = name
        self.descriptiveAssetUrl = descriptiveAssetUrl
        self.standardAssetUrl = standardAssetUrl
    }
}
