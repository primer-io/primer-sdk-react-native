//
//  PrimerCheckoutAdditionalInfoRN.swift
//  primer-io-react-native
//
//  Created by Flaviu Dunca on 17.06.2024.
//

import Foundation
import PrimerSDK

protocol PrimerCheckoutAdditionalInfoRN: Encodable {
    var additionalInfoName: String { get }
}

class MultibancoCheckoutAdditionalInfoRN: PrimerCheckoutAdditionalInfoRN {
    let expiresAt: String?
    let reference: String?
    let entity: String?
    let additionalInfoName: String = "MultibancoCheckoutAdditionalInfo"

    init(expiresAt: String?, reference: String?, entity: String?) {
        self.expiresAt = expiresAt
        self.reference = reference
        self.entity = entity
    }
}

protocol PrimerCheckoutQRCodeInfoRN: PrimerCheckoutAdditionalInfoRN {}

class PromptPayCheckoutAdditionalInfoRN: PrimerCheckoutQRCodeInfoRN {
    let expiresAt: String
    let qrCodeUrl: String?
    let qrCodeBase64: String?
    var additionalInfoName: String = "PromptPayCheckoutAdditionalInfo"

    init(expiresAt: String, qrCodeUrl: String?, qrCodeBase64: String?) {
        self.expiresAt = expiresAt
        self.qrCodeUrl = qrCodeUrl
        self.qrCodeBase64 = qrCodeBase64
    }
}

protocol PrimerCheckoutVoucherInfoRN: PrimerCheckoutAdditionalInfoRN {}

class XenditCheckoutVoucherAdditionalInfoRN: PrimerCheckoutVoucherInfoRN {
    let expiresAt: String
    let couponCode: String
    let retailerName: String?
    var additionalInfoName: String = "XenditCheckoutVoucherAdditionalInfo"

    init(expiresAt: String, couponCode: String, retailerName: String?) {
        self.expiresAt = expiresAt
        self.couponCode = couponCode
        self.retailerName = retailerName
    }
}

class AchAdditionalInfoDisplayMandateRN: PrimerCheckoutAdditionalInfoRN {
    var additionalInfoName: String = "DisplayStripeAchMandateAdditionalInfo"
}
