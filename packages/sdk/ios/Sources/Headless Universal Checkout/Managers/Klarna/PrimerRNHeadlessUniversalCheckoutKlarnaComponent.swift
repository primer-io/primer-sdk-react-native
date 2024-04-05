//
//  PrimerRNHeadlessUniversalCheckoutKlarnaComponent.k.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 01.04.2024.
//

import Foundation
import UIKit
import PrimerSDK

@objc(RNTPrimerHeadlessUniversalCheckoutKlarnaComponent)
class RNTPrimerHeadlessUniversalCheckoutKlarnaComponent: RCTEventEmitter {
    
    private var klarnaManager: PrimerHeadlessUniversalCheckout.KlarnaManager = PrimerHeadlessUniversalCheckout.KlarnaManager()
    var klarnaComponent: (any KlarnaComponent)?
    
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
    public func configure(
        _ primerSessionIntent: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        print("configure")
        
        do {
            guard let sessionIntent: PrimerSessionIntent = PrimerSessionIntent(rawValue: primerSessionIntent) else {
                let err = RNTNativeError(
                    errorId: "native-ios",
                    errorDescription: "Invalid value for 'intent'.",
                    recoverySuggestion: "'intent' can be 'CHECKOUT' or 'VAULT'.")
                throw err
            }
            
            klarnaComponent = try klarnaManager.provideKlarnaComponent(with: sessionIntent)
            klarnaComponent?.stepDelegate = self
            klarnaComponent?.errorDelegate = self
            klarnaComponent?.validationDelegate = self
            
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
        klarnaComponent = nil
        resolver(nil)
    }
    
    @objc
    public func start(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        print("Start Klarna process")
        
        guard let klarnaComponent = self.klarnaComponent else {
            rejecter("UNINITIALIZED_ERROR", "Klarna component is uninitialized", nil)
            return
        }
        
        klarnaComponent.start()
        resolver(nil)
    }
    
    @objc
    public func submit(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let klarnaComponent = self.klarnaComponent else {
            rejecter("UNINITIALIZED_ERROR", "Klarna component is uninitialized", nil)
            return
        }
        
        klarnaComponent.submit()
        resolver(nil)
    }
    
    @objc
    public func onSetPaymentOptions(
        _ paymentOptions: NSDictionary,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let paymentCategoryDict = paymentOptions["paymentCategory"] as? NSDictionary else {
            rejecter("error", "paymentCategory is missing or not a dictionary", nil)
            return
        }
        
        guard let klarnaPaymentCategory = getDecodedKlarnaPaymentCategory(paymentCategoryDict) else {
            rejecter("error", "Failed to parse paymentCategory", nil)
            return
        }
        
        guard let klarnaComponent = self.klarnaComponent else {
            rejecter("UNINITIALIZED_ERROR", "Klarna component is uninitialized", nil)
            return
        }
        
        klarnaComponent.updateCollectedData(collectableData: KlarnaCollectableData.paymentCategory(klarnaPaymentCategory, clientToken: ""))
        resolver(nil)
    }
    
    @objc
    public func onFinalizePayment(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        klarnaComponent?.updateCollectedData(collectableData: KlarnaCollectableData.finalizePayment)
        resolver(nil)
    }
    
    private func getDecodedKlarnaPaymentCategory(_ dictionary: NSDictionary) -> KlarnaPaymentCategory? {
        let transformedDictionary = transformKey(for: dictionary)
        guard let jsonData = try? JSONSerialization.data(withJSONObject: transformedDictionary, options: []) else { return nil }
        let paymentCategory = try? JSONDecoder().decode(KlarnaPaymentCategory.self, from: jsonData)
        return paymentCategory
    }
    
    private func transformKey(for dictionary: NSDictionary) -> [String: Any] {
        let transformedDictionary = dictionary.reduce(into: [String: Any]()) { (result, element) in
            // Check if the current key is "identifier" and change it to "id", otherwise keep the original key
            let key: String = (element.key as? String) == "identifier" ? "id" : (element.key as? String) ?? ""
            result[key] = element.value
        }
        
        return transformedDictionary
    }
}

extension RNTPrimerHeadlessUniversalCheckoutKlarnaComponent: PrimerHeadlessSteppableDelegate {
    func didReceiveStep(step: PrimerSDK.PrimerHeadlessStep) {
        guard let step = step as? KlarnaStep else { return }
        
        switch step {
        case .paymentSessionCreated(_ , let categories):
            let rnSessionCreated = try? step.toPaymentSessionCreatedRN(categories: categories).toJsonObject()
            
            sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
                body: rnSessionCreated
            )
            
        case .paymentSessionAuthorized(_ , _):
            let rnSessionAuthorized = try? step.toPaymentSessionAuthorizedRN(isFinalized: true).toJsonObject()
            
            sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
                body: rnSessionAuthorized
            )
            
        case .paymentSessionFinalizationRequired:
            let rnSessionAuthorized = try? step.toPaymentSessionAuthorizedRN(isFinalized: false).toJsonObject()
            
            sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
                body: rnSessionAuthorized
            )
            
        case .paymentSessionFinalized(_ , _):
            let rnSessionFinalized = try? step.toPaymentSessionFinalizedRN().toJsonObject()
            
            sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
                body: rnSessionFinalized
            )
            
        case .viewLoaded(let view):
            let rnPaymentViewLoaded = try? step.toPaymentViewLoadedRN().toJsonObject()
            
            sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
                body: rnPaymentViewLoaded
            )
        default:
            break
        }
        
        
    }
}

extension RNTPrimerHeadlessUniversalCheckoutKlarnaComponent: PrimerHeadlessValidatableDelegate {
    func didUpdate(validationStatus: PrimerSDK.PrimerValidationStatus, for data: PrimerSDK.PrimerCollectableData?) {
        guard let data = data as? KlarnaCollectableData else { return }
        
        let eventName: String
        switch validationStatus {
        case .valid:
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValid.stringValue
        case .validating:
            eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValidating.stringValue
        case .invalid(let errors):
            let rnErrors = errors.map { $0.toPrimerValidationErrorRN() }
            let serializedData = try? ["errors": rnErrors].toJsonObject()
            
            self.sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onInvalid.stringValue,
                body: serializedData)
            return
        case .error(let error):
            let rnError = error.toPrimerErrorRN()
            let serializedData = try? ["errors": [rnError]].toJsonObject()
            
            self.sendEvent(
                withName: PrimerHeadlessUniversalCheckoutComponentEvent.onValidationError.stringValue,
                body: serializedData)
            return
        }

        var serializedData: Any?
        switch data {
        case .paymentCategory(let category, _):
            let rnPaymentCategory = data.toKlarnaPaymentOptionsRN(category: category)
            serializedData = try? ["data": rnPaymentCategory].toJsonObject()
        case .finalizePayment:
            let rnFinalizePayment = data.toFinalizePaymentRN()
            serializedData = try? ["data": rnFinalizePayment].toJsonObject()
        }

        sendEvent(withName: eventName, body: serializedData)
    }
}

extension RNTPrimerHeadlessUniversalCheckoutKlarnaComponent: PrimerHeadlessErrorableDelegate {
    func didReceiveError(error: PrimerSDK.PrimerError) {
        let rnError = error.toPrimerErrorRN()
        let serializedData = try? ["errors": [rnError]].toJsonObject()
        
        self.sendEvent(
            withName: PrimerHeadlessUniversalCheckoutComponentEvent.onError.stringValue,
            body: serializedData)
    }
}
