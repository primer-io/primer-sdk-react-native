//
//  PrimerFlowRN.swift
//  ReactNative
//
//  Created by Carl Eriksson on 10/08/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//
import PrimerSDK

class PrimerFlowRN {
    static func fromString(_ value: String) -> PrimerSessionFlow? {
        switch value {
          // VAULT
        case "vaultWithAny": return .defaultWithVault
        case "vaultWithCard": return .addCardToVault
        case "vaultWithKlarna": return .addKlarnaToVault
        case "vaultWithPayPal": return .addPayPalToVault
        // PAY
        case "payWithAny": return .default
        case "payWithCard": return .completeDirectCheckout
        case "payWithKlarna": return .checkoutWithKlarna
        case "payWithApplePay": return .checkoutWithApplePay
        default: return nil
        }
    }
}
