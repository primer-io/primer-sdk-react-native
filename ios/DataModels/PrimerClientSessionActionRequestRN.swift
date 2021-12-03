//
//  PrimerClientSessionActionRequestRN.swift
//  primer-io-react-native
//
//  Created by Carl Eriksson on 03/12/2021.
//

import Foundation

struct PrimerClientSessionActionRequestRN: Codable {
    let type: String
    let paymentMethodType: String?
    let network: String?
}
