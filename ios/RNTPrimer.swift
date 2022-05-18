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
    
    private var primerWillCreatePaymentWithDataDecisionHandler: ((String?, Error?) -> Void)?
    private var primerDidFailWithErrorDecisionHandler: ((String?, Error?) -> Void)?
    private var primerDidTokenizePaymentMethodDecisionHandler: ((String?, Error?) -> Void)?
    private var primerDidResumeWithDecisionHandler: ((String?, Error?) -> Void)?
    
    
    
    
    private var implementedReactNativeCallbacks: ImplementedReactNativeCallbacks?
    
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
    
    // MARK: - API
    
    @objc
    public func configure(_ settingsStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                try self.configure(settingsStr: settingsStr.isEmpty ? nil : settingsStr)
                resolver(nil)
            } catch {
                self.primerDidFailWithError(error, data: nil) { decisionHandler in
                    
                }
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
    
//    @objc
//    public func handleNewClientToken(_ clientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
//        DispatchQueue.main.async {
//            self.callCallbackWithClientToken(clientToken)
//            resolver(nil)
//        }
//    }
//
//    @objc
//    public func handleError(_ errorStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
//        DispatchQueue.main.async {
//            do {
//                guard let errorData = errorStr.data(using: .utf8) else {
//                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
//                    throw err
//                }
//
//                let err = try JSONDecoder().decode(NativeError.self, from: errorData)
//                self.callCallbackWithError(err)
//                resolver(nil)
//            } catch {
//                self.checkoutFailed(with: error)
//                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
//            }
//        }
//    }
//
//    @objc
//    public func handleSuccess(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
//        DispatchQueue.main.async {
//            self.callCallbackToContinueFlow()
//            resolver(nil)
//        }
//    }
    
    @objc
    public func setImplementedRNCallbacks(_ implementedRNCallbacksStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                guard let implementedRNCallbacksData = implementedRNCallbacksStr.data(using: .utf8) else {
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
                    throw err
                }
                self.implementedReactNativeCallbacks = try JSONDecoder().decode(ImplementedReactNativeCallbacks.self, from: implementedRNCallbacksData)
                Primer.shared.setImplementedReactNativeCallbacks(self.implementedReactNativeCallbacks!)
                resolver(nil)
            } catch {
                self.primerDidFailWithError(error, data: nil) { decisionHandler in
                    
                }
//                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    // MARK: - HELPERS
    
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
    
//    private func callCallbackWithError(_ err: Error) {
//        self.clientTokenCallback?(nil, err)
//        self.onClientSessionActions?(nil, err)
//        self.onTokenizeSuccess?(nil, err)
//        self.onResumeSuccess?(nil, err)
//        self.removeCallbacksAndHandlers()
//    }
//
//    private func callCallbackToContinueFlow() {
//        self.clientTokenCallback?(nil, nil)
//        self.onClientSessionActions?(nil, nil)
//        self.onTokenizeSuccess?(nil, nil)
//        self.onResumeSuccess?(nil, nil)
//        self.removeCallbacksAndHandlers()
//    }
//
//    private func removeCallbacksAndHandlers() {
//        self.clientTokenCallback = nil
//        self.onClientSessionActions = nil
//        self.onTokenizeSuccess = nil
//        self.onResumeSuccess = nil
//    }
}

extension RNTPrimer: PrimerDelegate {
    
    func primerDidCompleteCheckoutWithData(_ data: PrimerCheckoutData) {
        
    }
    
    func primerWillCreatePaymentWithData(_ data: PrimerCheckoutPaymentMethodData, decisionHandler: @escaping (PrimerPaymentCreationDecision) -> Void) {
        
    }
    
    func primerClientSessionWillUpdate() {
        
    }
    
    func primerClientSessionDidUpdate(_ clientSession: PrimerClientSession) {
        
    }
    
    func primerDidTokenizePaymentMethod(_ paymentMethodTokenData: PrimerPaymentMethodTokenData, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
        
    }
    
    func primerDidResumeWith(_ resumeToken: String, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
        
    }
    
    func primerDidDismiss() {
        
    }
    
    func primerDidFailWithError(_ error: Error, data: PrimerCheckoutData?, decisionHandler: @escaping ((PrimerErrorDecision) -> Void)) {
        
    }
}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
//    func clientTokenCallback(_ completion: @escaping (String?, Error?) -> Void) {
//        DispatchQueue.main.async {
//            if self.implementedReactNativeCallbacks?.isClientTokenCallbackImplemented == true {
//                self.clientTokenCallback = { (clientToken, err) in
//                    completion(clientToken, err)
//                    self.removeCallbacksAndHandlers()
//                }
//                self.sendEvent(withName: PrimerEvents.onClientTokenCallback.stringValue, body: nil)
//            } else {
//                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [clientTokenCallback] should had been implemented."])
//                completion(nil, err)
//            }
//        }
//    }
//
//    func onClientSessionActions(_ actions: [ClientSession.Action], resumeHandler: ResumeHandlerProtocol?) {
//        DispatchQueue.main.async {
//            if self.implementedReactNativeCallbacks?.isClientSessionActionsImplemented == true {
//                self.onClientSessionActions = { (newClientToken, err) in
//                    if let err = err {
//                        resumeHandler?.handle(error: err)
//                    } else if let newClientToken = newClientToken {
//                        resumeHandler?.handle(newClientToken: newClientToken)
//                    } else {
//                        resumeHandler?.handleSuccess()
//                    }
//                }
//
//                do {
//                    let actionsData = try JSONEncoder().encode(actions)
//                    let actionsJson = try JSONSerialization.jsonObject(with: actionsData, options: .allowFragments)
//                    self.sendEvent(withName: PrimerEvents.onClientSessionActions.stringValue, body: actionsJson)
//                } catch {
//                    self.checkoutFailed(with: error)
//                }
//            } else {
//                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onClientSessionActions] should had been implemented."])
//                resumeHandler?.handle(error: err)
//            }
//
//        }
//    }
//
//    func onTokenizeSuccess(_ paymentMethodToken: PaymentMethodToken, resumeHandler: ResumeHandlerProtocol) {
//        DispatchQueue.main.async {
//            self.onTokenizeSuccess = { (newClientToken, err) in
//                if let err = err {
//                    resumeHandler.handle(error: err)
//                } else if let newClientToken = newClientToken {
//                    resumeHandler.handle(newClientToken: newClientToken)
//                } else {
//                    resumeHandler.handleSuccess()
//                }
//            }
//
//            do {
//                let paymentMethodTokenData = try JSONEncoder().encode(paymentMethodToken)
//                let paymentMethodTokenJson = try JSONSerialization.jsonObject(with: paymentMethodTokenData, options: .allowFragments)
//                self.sendEvent(withName: PrimerEvents.onTokenizeSuccessCallback.stringValue, body: paymentMethodTokenJson)
//            } catch {
//                self.checkoutFailed(with: error)
//            }
//        }
//    }
//
//    func onResumeSuccess(_ clientToken: String, resumeHandler: ResumeHandlerProtocol) {
//        DispatchQueue.main.async {
//            if self.implementedReactNativeCallbacks?.isOnResumeSuccessImplemented == true {
//                self.onResumeSuccess = { (newClientToken, err) in
//                    if let err = err {
//                        resumeHandler.handle(error: err)
//                    } else if let newClientToken = newClientToken {
//                        resumeHandler.handle(newClientToken: newClientToken)
//                    } else {
//                        resumeHandler.handleSuccess()
//                    }
//                }
//
//                self.sendEvent(withName: PrimerEvents.onResumeSuccess.stringValue, body: ["resumeToken": clientToken])
//            } else {
//                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onResumeSuccess] should had been implemented."])
//                resumeHandler.handle(error: err)
//            }
//        }
//    }
//
//    func onResumeError(_ error: Error) {
//        DispatchQueue.main.async {
//            if self.implementedReactNativeCallbacks?.isOnResumeErrorImplemented == true {
//                self.checkoutFailed(with: error)
//            } else {
//                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onResumeError] should had been implemented."])
//                self.checkoutFailed(with: err)
//            }
//        }
//    }
//
//    func onCheckoutDismissed() {
//        DispatchQueue.main.async {
//            if self.implementedReactNativeCallbacks?.isOnCheckoutDismissedImplemented == true {
//                self.sendEvent(withName: PrimerEvents.onCheckoutDismissed.stringValue, body: nil)
//            } else {
//                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onCheckoutDismissed] should had been implemented."])
//                self.checkoutFailed(with: err)
//            }
//        }
//    }
//
//    func checkoutFailed(with error: Error) {
//        DispatchQueue.main.async {
//            self.sendEvent(withName: PrimerEvents.onError.stringValue, body: ["error": error.rnError])
//        }
//    }
