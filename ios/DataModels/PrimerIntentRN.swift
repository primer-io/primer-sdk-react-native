//
//  PrimerFlowRN.swift
//  ReactNative
//
//  Created by Carl Eriksson on 10/08/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//
import PrimerSDK

struct PrimerIntentRN: Decodable {
    let flow: PrimerFlowRN
    let paymentMethod: PrimerPaymentMethodTypeRN
    
    
    func toPrimerSessionFlow() -> PrimerSessionFlow? {
        
        switch (flow) {
        case .Checkout:
            switch (paymentMethod) {
            case .Any:
                return .default
            case .ApplePay:
                return .checkoutWithApplePay
            case .Klarna:
                return .checkoutWithKlarna
            case .Card:
                return .completeDirectCheckout
            default:
                return nil
            }
        case .Vault:
            switch (paymentMethod) {
            case .Any:
                return .defaultWithVault
            case .Klarna:
                return .addKlarnaToVault
            case .PayPal:
                return .addPayPalToVault
            case .Card:
                return .defaultWithVault
            default:
                return nil
            }
        }
    }
}

enum PrimerFlowRN: String, Decodable {
    case Checkout, Vault
}

enum PrimerPaymentMethodTypeRN: String, Decodable {
    case `Any`, Klarna, Card, PayPal, GooglePay, ApplePay, GoCardless
}
