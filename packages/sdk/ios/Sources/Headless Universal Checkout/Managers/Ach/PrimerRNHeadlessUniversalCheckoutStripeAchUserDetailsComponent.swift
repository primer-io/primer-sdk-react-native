//
//  PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.swift
//  Pods
//
//  Created by Flaviu Dunca on 12.06.2024.
//

import Foundation
import UIKit
import PrimerSDK

// swiftlint:disable type_name
@objc(RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent)
class RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent: RCTEventEmitter {
    // swiftlint:enable type_name

    #if canImport(PrimerStripeSDK)
    private var achManager: PrimerHeadlessUniversalCheckout.AchManager = PrimerHeadlessUniversalCheckout.AchManager()
    #endif
    var stripeAchUserDetailsComponent: (any StripeAchUserDetailsComponent)?
    var clientToken: String?

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    override init() {
        super.init()
    }

    override func supportedEvents() -> [String] {
        return PrimerHeadlessUniversalCheckoutComponentEvent.allCases.compactMap({ $0.stringValue })
    }

    // MARK: - API

    @objc
    public func configure(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        print("configure")

        do {
            #if canImport(PrimerStripeSDK)
            guard let stripeAchUserDetailsComponent: any StripeAchUserDetailsComponent =
                    try? achManager.provide(paymentMethodType: "STRIPE_ACH") else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to find asset of STRIPE_ACH for this session",
                    recoverySuggestion: nil)
                throw err
            }
            self.stripeAchUserDetailsComponent = stripeAchUserDetailsComponent
            RNTAchMandateManager.mandateDelegate = achManager.mandateDelegate
            stripeAchUserDetailsComponent.stepDelegate = self
            stripeAchUserDetailsComponent.errorDelegate = self
            stripeAchUserDetailsComponent.validationDelegate = self
            #else
            let err = RNTNativeError(
                errorId: "native-ios",
                errorDescription: "PrimerStripeSDK missing",
                recoverySuggestion: "Check if PrimerStripeSDK is included in your Podfile")

            throw err
            #endif

            resolver(nil)
        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }

    @objc
    public func cleanUp(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        RNTAchMandateManager.mandateDelegate = nil
        stripeAchUserDetailsComponent = nil
        resolver(nil)
    }

    @objc
    public func start(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        print("Start Stripe ACH process")

        guard let stripeAchUserDetailsComponent = self.stripeAchUserDetailsComponent else {
            rejecter("UNINITIALIZED_ERROR", "Stripe ACH user details component is uninitialized", nil)
            return
        }

        stripeAchUserDetailsComponent.start()
        resolver(nil)
    }

    @objc
    public func submit(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let stripeAchUserDetailsComponent = self.stripeAchUserDetailsComponent else {
            rejecter("UNINITIALIZED_ERROR", "Stripe ACH user details component is uninitialized", nil)
            return
        }

        stripeAchUserDetailsComponent.submit()
        resolver(nil)
    }

    @objc
    public func onSetFirstName(
        _ firstName: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let stripeAchUserDetailsComponent = self.stripeAchUserDetailsComponent else {
            rejecter("UNINITIALIZED_ERROR", "Stripe ACH user details component is uninitialized", nil)
            return
        }

        DispatchQueue.main.async {
            stripeAchUserDetailsComponent.updateCollectedData(collectableData: ACHUserDetailsCollectableData.firstName(firstName))
        }

        resolver(nil)
    }

    @objc
    public func onSetLastName(
        _ lastName: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let stripeAchUserDetailsComponent = self.stripeAchUserDetailsComponent else {
            rejecter("UNINITIALIZED_ERROR", "Stripe ACH user details component is uninitialized", nil)
            return
        }

        DispatchQueue.main.async {
            stripeAchUserDetailsComponent.updateCollectedData(collectableData: ACHUserDetailsCollectableData.lastName(lastName))
        }

        resolver(nil)
    }

    @objc
    public func onSetEmailAddress(
        _ emailAddress: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let stripeAchUserDetailsComponent = self.stripeAchUserDetailsComponent else {
            rejecter("UNINITIALIZED_ERROR", "Stripe ACH user details component is uninitialized", nil)
            return
        }

        DispatchQueue.main.async {
            stripeAchUserDetailsComponent.updateCollectedData(collectableData: ACHUserDetailsCollectableData.emailAddress(emailAddress))
        }

        resolver(nil)
    }
}

extension RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent: PrimerHeadlessSteppableDelegate {
    func didReceiveStep(step: PrimerSDK.PrimerHeadlessStep) {
        guard let step = step as? ACHUserDetailsStep else { return }

        switch step {
        case .retrievedUserDetails(let details):
            let json = try? step.toUserDetailsRetrievedRN(
                firstName: details.firstName,
                lastName: details.lastName,
                emailAddress: details.emailAddress
            ).toJsonObject()

            sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
                body: json
            )

        case .didCollectUserDetails:
            let json = try? step.toUserDetailsCollectedRN().toJsonObject()

            sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
                body: json
            )

        default:
            break
        }
    }
}

extension RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent: PrimerHeadlessValidatableDelegate {
    func didUpdate(validationStatus: PrimerSDK.PrimerValidationStatus, for data: PrimerSDK.PrimerCollectableData?) {
        guard let data = data as? ACHUserDetailsCollectableData else { return }

        var errorJsonObject: Any?
        let eventName: String

        switch validationStatus {
        case .valid:
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValid.stringValue
        case .validating:
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValidating.stringValue
        case .invalid(let errors):
            errorJsonObject = try? ["errors": errors.map { $0.toPrimerValidationErrorRN() }].toJsonObject()
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onInvalid.stringValue
        case .error(let error):
            errorJsonObject = try? ["errors": [error.toPrimerErrorRN()]].toJsonObject()
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValidationError.stringValue
        }

        var dataJsonObject: Any?
        switch data {
        case .firstName(let value):
            dataJsonObject = try? ["data": data.toFirstNameRN(value: value)].toJsonObject()
        case .lastName(let value):
            dataJsonObject = try? ["data": data.toLastNameRN(value: value)].toJsonObject()
        case .emailAddress(let value):
            dataJsonObject = try? ["data": data.toEmailAddressRN(value: value)].toJsonObject()
        }
        let allData = ((dataJsonObject as? [String: Any]) ?? [:]).merging((errorJsonObject as? [String: Any]) ?? [:]) { (_, new) in new }
        sendEvent(withName: eventName, body: allData)
    }
}

extension RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent: PrimerHeadlessErrorableDelegate {
    func didReceiveError(error: PrimerSDK.PrimerError) {
        let rnError = error.toPrimerErrorRN()
        let serializedData = try? ["errors": [rnError]].toJsonObject()

        self.sendEvent(
            withName: PrimerHeadlessUniversalCheckoutComponentEvent.onError.stringValue,
            body: serializedData)
    }
}
