//
//  NativeUIManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 6/10/22.
//

import Foundation
import PrimerSDK

// swiftlint:disable type_name
@objc(RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager)
class RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager: RCTEventEmitter {
    // swiftlint:enable type_name

    var paymentMethodNativeUIManager: PrimerSDK.PrimerHeadlessUniversalCheckout.NativeUIManager!

    override func supportedEvents() -> [String]! {
        return []
    }

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func configure(
        _ paymentMethod: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        do {
            self.paymentMethodNativeUIManager = try PrimerSDK.PrimerHeadlessUniversalCheckout.NativeUIManager(paymentMethodType: paymentMethod)
            resolver(nil)
        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }

    @objc
    func showPaymentMethod(_ intentStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        do {
            guard let paymentMethodNativeUIManager = paymentMethodNativeUIManager else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "The NativeUIManager has not been initialized.",
                    recoverySuggestion: "Initialize the NativeUIManager by calling the initialize function and providing a payment method type.")
                throw err
            }

            guard let intent = PrimerSessionIntent(rawValue: intentStr) else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Invalid value for 'intent'.",
                    recoverySuggestion: "'intent' can be 'CHECKOUT' or 'VAULT'.")
                throw err
            }

            try paymentMethodNativeUIManager.showPaymentMethod(intent: intent)

        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }
}
