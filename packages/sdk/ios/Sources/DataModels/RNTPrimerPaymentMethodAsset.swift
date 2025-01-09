//
//  RNTPrimerPaymentMethodAsset.swift
//  primer-io-react-native
//
//  Created by Evangelos on 6/10/22.
//

import Foundation
import PrimerSDK

struct RNTPrimerPaymentMethodAsset: Codable {

    let paymentMethodType: String
    let paymentMethodName: String
    let paymentMethodLogo: RNTPrimerPaymentMethodLogo
    let paymentMethodBackgroundColor: RNTPrimerPaymentMethodBackgroundColor

    init(primerPaymentMethodAsset: PrimerPaymentMethodAsset) {
        self.paymentMethodType = primerPaymentMethodAsset.paymentMethodType
        self.paymentMethodName = primerPaymentMethodAsset.paymentMethodName
        self.paymentMethodLogo = RNTPrimerPaymentMethodLogo(
            paymentMethodType: primerPaymentMethodAsset.paymentMethodType,
            primerPaymentMethodLogo: primerPaymentMethodAsset.paymentMethodLogo)
        self.paymentMethodBackgroundColor = RNTPrimerPaymentMethodBackgroundColor(
            primerPaymentMethodBackgroundColor: primerPaymentMethodAsset.paymentMethodBackgroundColor)
    }
}

struct RNTPrimerPaymentMethodLogo: Codable {

    let colored: String?
    let dark: String?
    let light: String?

    init(paymentMethodType: String, primerPaymentMethodLogo: PrimerAsset) {
        self.colored = (try? primerPaymentMethodLogo.colored?.store(withName: "\(paymentMethodType)-colored").absoluteString) ?? nil
        self.dark = (try? primerPaymentMethodLogo.dark?.store(withName: "\(paymentMethodType)-dark").absoluteString) ?? nil
        self.light = (try? primerPaymentMethodLogo.light?.store(withName: "\(paymentMethodType)-light").absoluteString) ?? nil
    }
}

struct RNTPrimerPaymentMethodBackgroundColor: Codable {

    let colored: String?
    let dark: String?
    let light: String?

    init(primerPaymentMethodBackgroundColor: PrimerPaymentMethodBackgroundColor) {
        if let bgColoredHex = primerPaymentMethodBackgroundColor.colored?.toHex() {
            self.colored = "#\(bgColoredHex)"
        } else {
            self.colored = nil
        }

        if let darkColoredHex = primerPaymentMethodBackgroundColor.dark?.toHex() {
            self.dark = "#\(darkColoredHex)"
        } else {
            self.dark = nil
        }

        if let lightColoredHex = primerPaymentMethodBackgroundColor.light?.toHex() {
            self.light = "#\(lightColoredHex)"
        } else {
            self.light = nil
        }
    }
}
