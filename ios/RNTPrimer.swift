//
//  Primer.swift
//  primer-io-react-native
//
//  Created by Evangelos on 15/3/22.
//

import Foundation
import PrimerSDK
import UIKit

@objc
enum PrimerEvents: Int, CaseIterable {
    case primerDidCompleteCheckoutWithData = 0
    case primerClientSessionWillUpdate
    case primerClientSessionDidUpdate
    case primerWillCreatePaymentWithData
    case primerDidDismiss
    case primerDidTokenizePaymentMethod
    case primerDidResumeWith
    case primerDidFailWithError
    case detectImplementedRNCallbacks
    
    var stringValue: String {
        switch self {
        case .primerDidCompleteCheckoutWithData:
            return "primerDidCompleteCheckoutWithData"
        case .primerClientSessionWillUpdate:
            return "primerClientSessionWillUpdate"
        case .primerClientSessionDidUpdate:
            return "primerClientSessionDidUpdate"
        case .primerWillCreatePaymentWithData:
            return "primerWillCreatePaymentWithData"
        case .primerDidDismiss:
            return "primerDidDismiss"
        case .primerDidTokenizePaymentMethod:
            return "primerDidTokenizePaymentMethod"
        case .primerDidResumeWith:
            return "primerDidResumeWith"
        case .primerDidFailWithError:
            return "primerDidFailWithError"
        case .detectImplementedRNCallbacks:
            return "detectImplementedRNCallbacks"
        }
    }
}

@objc(NativePrimer)
class RNTPrimer: RCTEventEmitter {
    
//    private var isClientTokenCallbackImplementedInRN: Bool?
//    private var clientTokenCallback: ((String?, Error?) -> Void)?
//    private var isOnClientSessionActionsImplementedInRN: Bool?
//    private var onClientSessionActions: ((String?, Error?) -> Void)?
    
    private var primerWillCreatePaymentWithDataDecisionHandler: ((_ errorMessage: String?) -> Void)?
    private var primerDidTokenizePaymentMethodDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    private var primerDidResumeWithDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    private var primerDidFailWithErrorDecisionHandler: ((_ errorMessage: String) -> Void)?
    private var implementedRNCallbacks: ImplementedRNCallbacks?
    
    // MARK: - INITIALIZATION & REACT NATIVE SUPPORT
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    deinit {
        print("🧨 deinit: \(self) \(Unmanaged.passUnretained(self).toOpaque())")
    }
    
    override init() {
        super.init()
        PrimerSDK.Primer.shared.delegate = self
    }
    
    override func supportedEvents() -> [String]! {
        return PrimerEvents.allCases.compactMap({ $0.stringValue })
    }
    
    // MARK: - SDK API
    
    @objc
    public func configure(_ settingsStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                try self.configure(settingsStr: settingsStr.isEmpty ? nil : settingsStr)
                resolver(nil)
            } catch {
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    @objc
    public func showUniversalCheckoutWithClientToken(_ clientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.showUniversalCheckout(clientToken: clientToken) { err in
                DispatchQueue.main.async {
                    if let err = err {
                        rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
                    } else {
                        resolver(nil)
                    }
                }
            }
        }
    }
    
    @objc
    public func showVaultManagerWithClientToken(_ clientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.showVaultManager(clientToken: clientToken) { err in
                DispatchQueue.main.async {
                    if let err = err {
                        rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
                    } else {
                        resolver(nil)
                    }
                }
            }
        }
    }
    
    @objc
    public func showPaymentMethod(_ paymentMethodStr: String, intent: String, clientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                let paymentMethodType = PrimerPaymentMethodType(rawValue: paymentMethodStr)
                
                guard paymentMethodType != PrimerPaymentMethodType.other(rawValue: paymentMethodStr) else {
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Payment method type \(paymentMethodStr) is not valid."])
                    throw err
                }
                
                guard let primerIntent = PrimerSessionIntent(rawValue: intent) else {
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Intent \(intent) is not valid."])
                    throw err
                }
                
                PrimerSDK.Primer.shared.showPaymentMethod(paymentMethodType, withIntent: primerIntent, andClientToken: clientToken) { err in
                    DispatchQueue.main.async {
                        if let err = err {
                            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
                        } else {
                            resolver(nil)
                        }
                    }
                }
            } catch {
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    @objc
    public func dismiss() {
        Primer.shared.dismiss()
    }
    
    // MARK: - DECISION HANDLERS
    
    // MARK: Tokenization
    
    @objc
    public func handleTokenizationNewClientToken(_ newClientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(newClientToken, nil)
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handleTokenizationSuccess(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(nil, nil)
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handleTokenizationFailure(_ errorMessage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(nil, errorMessage ?? "")
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            resolver(nil)
        }
    }
    
    // MARK: Resume Payment
    
    @objc
    public func handleResumeWithNewClientToken(_ newClientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(newClientToken, nil)
            self.primerDidResumeWithDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handleResumeSuccess(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(nil, nil)
            self.primerDidResumeWithDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handleResumeFailure(_ errorMessage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(nil, errorMessage ?? "")
            self.primerDidResumeWithDecisionHandler = nil
            resolver(nil)
        }
    }
    
    // MARK: Payment Creation
    
    @objc
    public func handlePaymentCreationAbort(_ errorMessage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerWillCreatePaymentWithDataDecisionHandler?(errorMessage ?? "")
            self.primerWillCreatePaymentWithDataDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handlePaymentCreationContinue(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerWillCreatePaymentWithDataDecisionHandler?(nil)
            self.primerWillCreatePaymentWithDataDecisionHandler = nil
            resolver(nil)
        }
    }
    
    // MARK: Error Handler
    
    @objc
    public func handleErrorMessage(_ errorMessage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidFailWithErrorDecisionHandler?(errorMessage ?? "")
            self.primerDidFailWithErrorDecisionHandler = nil
            resolver(nil)
        }
    }
    
    // MARK: Helpers
        
    private func configure(settingsStr: String? = nil) throws {
        var settings: PrimerSettings?
        if let settingsStr = settingsStr {
            guard let settingsData = settingsStr.data(using: .utf8) else {
                let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
                throw err
            }
            let settingsRN = try JSONDecoder().decode(PrimerSettingsRN.self, from: settingsData)
            settings = settingsRN.asPrimerSettings()
        }
    
        PrimerSDK.Primer.shared.configure(settings: settings, delegate: self)
    }
    
    private func detectImplemetedCallbacks() {
        sendEvent(withName: PrimerEvents.detectImplementedRNCallbacks.stringValue, body: nil)
    }
    
    @objc
    public func setImplementedRNCallbacks(_ implementedRNCallbacksStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                guard let implementedRNCallbacksData = implementedRNCallbacksStr.data(using: .utf8) else {
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
                    throw err
                }
                self.implementedRNCallbacks = try JSONDecoder().decode(ImplementedRNCallbacks.self, from: implementedRNCallbacksData)
                resolver(nil)
            } catch {
                self.primerDidFailWithError(error, data: nil) { decisionHandler in
                    
                }
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    private func handleRNBridgeError(_ error: Error, stopOnDebug: Bool) {
        DispatchQueue.main.async {
            if stopOnDebug {
                assertionFailure(error.localizedDescription)
            }
            self.sendEvent(withName: PrimerEvents.primerDidFailWithError.stringValue, body: error.rnError)
        }
    }
}

// MARK: - PRIMER DELEGATE

extension RNTPrimer: PrimerDelegate {
    
    func primerDidCompleteCheckoutWithData(_ data: PrimerCheckoutData) {
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isPrimerDidCompleteCheckoutWithDataImplemented == true {
                do {
                    let checkoutData = try JSONEncoder().encode(data)
                    let checkoutJson = try JSONSerialization.jsonObject(with: checkoutData, options: .allowFragments)
                    self.sendEvent(withName: PrimerEvents.primerDidCompleteCheckoutWithData.stringValue, body: checkoutJson)
                } catch {
                    self.handleRNBridgeError(error, stopOnDebug: true)
                }
            } else {
                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onCheckoutComplete] should be implemented."])
                self.handleRNBridgeError(err, stopOnDebug: false)
            }
        }
    }
    
    func primerWillCreatePaymentWithData(_ data: PrimerCheckoutPaymentMethodData, decisionHandler: @escaping (PrimerPaymentCreationDecision) -> Void) {
        if self.implementedRNCallbacks?.isPrimerWillCreatePaymentWithDataImplemented == true {
            self.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
                DispatchQueue.main.async {
                    if let errorMessage = errorMessage {
                        decisionHandler(.abortPaymentCreation(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                    } else {
                        decisionHandler(.continuePaymentCreation())
                    }
                }
            }
            
            DispatchQueue.main.async {
                do {
                    let checkoutPaymentmethodData = try JSONEncoder().encode(data)
                    let checkoutPaymentmethodJson = try JSONSerialization.jsonObject(with: checkoutPaymentmethodData, options: .allowFragments)
                    self.sendEvent(withName: PrimerEvents.primerWillCreatePaymentWithData.stringValue, body: checkoutPaymentmethodJson)
                } catch {
                    self.handleRNBridgeError(error, stopOnDebug: true)
                }
            }
        } else {
            // RN Dev hasn't implemented this callback, send a decision to continue the flow.
            DispatchQueue.main.async {
                decisionHandler(.continuePaymentCreation())
            }
        }
    }
    
    func primerClientSessionWillUpdate() {
        if self.implementedRNCallbacks?.isPrimerClientSessionWillUpdateImplemented == true {
            DispatchQueue.main.async {
                self.sendEvent(withName: PrimerEvents.primerClientSessionWillUpdate.stringValue, body: nil)
            }
        } else {
            // RN Dev hasn't implemented this callback, ignore.
        }
    }
    
    func primerClientSessionDidUpdate(_ clientSession: PrimerClientSession) {
        if self.implementedRNCallbacks?.isPrimerClientSessionDidUpdateImplemented == true {
            do {
                let data = try JSONEncoder().encode(clientSession)
                let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
                DispatchQueue.main.async {
                    self.sendEvent(withName: PrimerEvents.primerClientSessionDidUpdate.stringValue, body: json)
                }
            } catch {
                self.handleRNBridgeError(error, stopOnDebug: true)
            }
        } else {
            // RN Dev hasn't implemented this callback, ignore.
        }
    }
    
    func primerDidTokenizePaymentMethod(_ paymentMethodTokenData: PrimerPaymentMethodTokenData, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
        if self.implementedRNCallbacks?.isPrimerDidTokenizePaymentMethodImplemented == true {
            self.primerDidTokenizePaymentMethodDecisionHandler = { (newClientToken, errorMessage) in
                DispatchQueue.main.async {
                    if let errorMessage = errorMessage {
                        decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                    } else if let newClientToken = newClientToken {
                        decisionHandler(.continueWithNewClientToken(newClientToken))
                    } else {
                        decisionHandler(.succeed())
                    }
                }
            }
            
            do {
                let data = try JSONEncoder().encode(paymentMethodTokenData)
                let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
                DispatchQueue.main.async {
                    self.sendEvent(withName: PrimerEvents.primerDidTokenizePaymentMethod.stringValue, body: json)
                }
            } catch {
                self.handleRNBridgeError(error, stopOnDebug: true)
            }
        } else {
            // RN dev hasn't opted in on listening the tokenization callback.
            // Throw an error if it's the manual flow, ignore if it's the
            // auto flow.
        }
    }
    
    func primerDidResumeWith(_ resumeToken: String, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
        if self.implementedRNCallbacks?.isPrimerDidResumeWithImplemented == true {
            self.primerDidResumeWithDecisionHandler = { (resumeToken, errorMessage) in
                DispatchQueue.main.async {
                    if let errorMessage = errorMessage {
                        decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                    } else if let resumeToken = resumeToken {
                        decisionHandler(.continueWithNewClientToken(resumeToken))
                    } else {
                        decisionHandler(.succeed())
                    }
                }
            }
            
            DispatchQueue.main.async {
                self.sendEvent(withName: PrimerEvents.primerDidResumeWith.stringValue, body: resumeToken)
            }
        } else {
            // RN dev hasn't opted in on listening the tokenization callback.
            // Throw an error if it's the manual flow.
        }
    }
    
    func primerDidDismiss() {
        if self.implementedRNCallbacks?.isPrimerDidDismissImplemented == true {
            DispatchQueue.main.async {
                self.sendEvent(withName: PrimerEvents.primerDidDismiss.stringValue, body: nil)
            }
        } else {
            // RN dev hasn't opted in on listening SDK dismiss.
            // Ignore!
        }
    }
    
    func primerDidFailWithError(_ error: Error, data: PrimerCheckoutData?, decisionHandler: @escaping ((PrimerErrorDecision) -> Void)) {
        if self.implementedRNCallbacks?.isPrimerDidFailWithErrorImplemented == true {
            // Set up the callback that will be called by **handleErrorMessage** when the RN
            // bridge invokes it.
            self.primerDidFailWithErrorDecisionHandler = { errorMessage in
                // Callback was called by **handleErrorMessage**.
                DispatchQueue.main.async {
                    decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                }
            }
            
            // Send the error message to the RN bridge.
            self.handleRNBridgeError(error, stopOnDebug: false)
            
        } else {
            // RN dev hasn't opted in on listening SDK dismiss.
            // Ignore!
        }
    }
}
