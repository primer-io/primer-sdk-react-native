//
//  PrimerCardFormUIOptionsRN.swift
//  primer-io-react-native
//
//  Created by Onur Var on 16.05.2025.
//

import PrimerSDK

struct PrimerCardFormUIOptionsRN: Decodable {
  let payButtonAddNewCard: Bool?
}

extension PrimerCardFormUIOptionsRN {
  func asPrimerCardFormUIOptions() -> PrimerCardFormUIOptions {
    let payButtonAddNewCard = payButtonAddNewCard ?? true
    return .init(payButtonAddNewCard: payButtonAddNewCard)
  }
}
