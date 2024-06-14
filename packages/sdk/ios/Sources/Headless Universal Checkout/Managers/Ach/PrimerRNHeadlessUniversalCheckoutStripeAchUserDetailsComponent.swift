//
//  PrimerRNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.swift
//  Pods
//
//  Created by Flaviu Dunca on 12.06.2024.
//

import Foundation
import UIKit
import PrimerSDK

@objc(RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent)
class RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent: RCTEventEmitter {
    
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
            guard let stripeAchUserDetailsComponent: any StripeAchUserDetailsComponent = try? achManager.provide(paymentMethodType: "STRIPE_ACH") else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Failed to find asset of STRIPE_ACH for this session",
                    recoverySuggestion: nil)
                throw err
            }
            self.stripeAchUserDetailsComponent = stripeAchUserDetailsComponent
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
            let json = try? step.toUserDetailsRetrievedRN(firstName: details.firstName, lastName: details.lastName, emailAddress: details.emailAddress).toJsonObject()
            
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
    
        let jsonEncoder = JSONEncoder()
        var allData = [String: Any]()
        let eventName: String
        
        switch validationStatus {
        case .valid:
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValid.stringValue
        case .validating:
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValidating.stringValue
        case .invalid(let errors):
            allData["errors"] = errors.map { $0.toPrimerValidationErrorRN() }
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onInvalid.stringValue
        case .error(let error):
            allData["errors"] = [error.toPrimerErrorRN()]
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValidationError.stringValue
        }
        
        switch data {
        case .firstName(let value):
            allData["data"] = data.toFirstNameRN(value: value)
        case .lastName(let value):
            allData["data"] = data.toLastNameRN(value: value)
        case .emailAddress(let value):
            allData["data"] = data.toEmailAddressRN(value: value)
        }
        
        let eventData: Data = (try? JSONSerialization.data(withJSONObject: allData, options: .fragmentsAllowed)) ?? Data()
        sendEvent(withName: eventName, body: try? JSONSerialization.jsonObject(with: eventData, options: .allowFragments))
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
