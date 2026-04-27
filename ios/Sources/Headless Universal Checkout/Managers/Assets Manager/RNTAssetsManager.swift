//
//  RNTAssetsManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 6/10/22.
//

import Foundation
import PrimerSDK
import React

// swiftlint:disable type_name
@objc(RNTPrimerHeadlessUniversalCheckoutAssetsManager)
class RNTPrimerHeadlessUniversalCheckoutAssetsManager: RCTEventEmitter {
    // swiftlint:enable type_name

    override func supportedEvents() -> [String]! {
        return []
    }

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func getCardNetworkTraits(
        _ cardNetworkStr: String,
        resolver: RCTPromiseResolveBlock,
        rejecter _: RCTPromiseRejectBlock
    ) {
        // iOS returns nil for networks without validation (bancontact, cartesBancaires, eftpos, unknown).
        // JS normalises null to DEFAULT_DESCRIPTOR.
        guard
            let traits = PrimerSDK.PrimerHeadlessUniversalCheckout.AssetsManager
                .getCardNetworkTraits(cardNetworkString: cardNetworkStr)
        else {
            resolver(nil)
            return
        }

        resolver([
            "cardNetwork": traits.cardNetwork.rawValue,
            "displayName": traits.displayName,
            "panLengths": traits.panLengths,
            "gapPattern": traits.gapPattern,
            "cvvLength": traits.cvvLength,
            "cvvLabel": traits.cvvLabel
        ])
    }

    @objc
    func getCardNetworkImage(
        _ cardNetworkStr: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        do {
            // Use the current `getCardNetworkAsset` API. The previous
            // `getCardNetworkImage(for:)` is deprecated and looks up
            // `"{rawValue}-logo-colored"` resources that the iOS SDK no longer
            // ships, so it fails for every network. `getCardNetworkAsset`
            // resolves `"{assetName}-card-icon-colored"` and wraps the
            // result in `PrimerCardNetworkAsset.cardImage`.
            guard
                let cardNetworkImage = PrimerSDK.PrimerHeadlessUniversalCheckout.AssetsManager
                    .getCardNetworkAsset(cardNetworkString: cardNetworkStr)?.cardImage
            else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to find asset of \(cardNetworkStr).",
                    recoverySuggestion: nil)
                throw err
            }

            let localUrl = try cardNetworkImage.store(withName: cardNetworkStr)
            resolver(["cardNetworkImageURL": localUrl.absoluteString])

        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }

    @objc
    func getPaymentMethodAsset(
        _ paymentMethodType: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        do {
            guard
                let paymentMethodAsset = try PrimerSDK.PrimerHeadlessUniversalCheckout.AssetsManager
                    .getPaymentMethodAsset(for: paymentMethodType)
            else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to find asset of \(paymentMethodType) for this session",
                    recoverySuggestion: nil)
                throw err
            }

            if let rntPaymentMethodAsset = try? RNTPrimerPaymentMethodAsset(
                primerPaymentMethodAsset: paymentMethodAsset
            ).toJsonObject() {
                resolver(["paymentMethodAsset": rntPaymentMethodAsset])
            } else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to create the RNTPrimerPaymentMethodAsset",
                    recoverySuggestion: nil)
                throw err
            }

        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }

    @objc
    func getPaymentMethodAssets(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        do {
            let paymentMethodAssets = try PrimerSDK.PrimerHeadlessUniversalCheckout.AssetsManager
                .getPaymentMethodAssets()

            let rntPaymentMethodAssets = paymentMethodAssets.compactMap({
                try? RNTPrimerPaymentMethodAsset(primerPaymentMethodAsset: $0).toJsonObject()
            })
            guard !rntPaymentMethodAssets.isEmpty else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to find assets for this session",
                    recoverySuggestion: nil)
                throw err
            }

            resolver(["paymentMethodAssets": rntPaymentMethodAssets])

        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }

    @objc
    func getPaymentMethodResources(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        do {
            let paymentMethodResources = try PrimerSDK.PrimerHeadlessUniversalCheckout.AssetsManager
                .getPaymentMethodAssets()

            let rntPaymentMethodResources = paymentMethodResources.compactMap({
                try? RNTPrimerPaymentMethodAsset(primerPaymentMethodAsset: $0).toJsonObject()
            })
            guard !rntPaymentMethodResources.isEmpty else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to find resources for this session",
                    recoverySuggestion: nil)
                throw err
            }

            resolver(["paymentMethodResources": rntPaymentMethodResources])

        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }

    @objc
    func getPaymentMethodResource(
        _ paymentMethodType: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        do {
            guard
                let paymentMethodResource = try PrimerSDK.PrimerHeadlessUniversalCheckout.AssetsManager
                    .getPaymentMethodAsset(for: paymentMethodType)
            else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to find resource of \(paymentMethodType) for this session",
                    recoverySuggestion: nil)
                throw err
            }

            if let rntPaymentMethodResource = try? RNTPrimerPaymentMethodAsset(
                primerPaymentMethodAsset: paymentMethodResource
            ).toJsonObject() {
                resolver(["paymentMethodResource": rntPaymentMethodResource])
            } else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to create the RNTPrimerPaymentMethodAsset",
                    recoverySuggestion: nil)
                throw err
            }

        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }
}
