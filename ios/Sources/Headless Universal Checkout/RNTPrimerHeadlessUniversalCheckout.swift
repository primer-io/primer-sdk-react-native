//
//  RNTPrimerHeadlessUniversalCheckout.swift
//  primer-io-react-native
//
//  Created by Evangelos on 8/3/22.
//

import Foundation
import PrimerSDK

@objc
enum PrimerHeadlessUniversalCheckoutEvents: Int, CaseIterable {
    
    // Delegate
    case onAvailablePaymentMethodsLoad = 0
    case onTokenizationStart
    case onTokenizationSuccess
    case onCheckoutResume
    case onCheckoutPending
    case onCheckoutAdditionalInfo
    case onError
    case onCheckoutComplete
    case onBeforeClientSessionUpdate
    case onClientSessionUpdate
    case onBeforePaymentCreate
    
    // UI Delegate
    case onPreparationStart
    case onPaymentMethodShow
    
    var stringValue: String {
        switch self {
        case .onAvailablePaymentMethodsLoad:
            return "onAvailablePaymentMethodsLoad"
        case .onTokenizationStart:
            return "onTokenizationStart"
        case .onTokenizationSuccess:
            return "onTokenizationSuccess"
        case .onCheckoutResume:
            return "onCheckoutResume"
        case .onCheckoutPending:
            return "onCheckoutPending"
        case .onCheckoutAdditionalInfo:
            return "onCheckoutAdditionalInfo"
        case .onError:
            return "onError"
        case .onBeforeClientSessionUpdate:
            return "onBeforeClientSessionUpdate"
        case .onCheckoutComplete:
            return "onCheckoutComplete"
        case .onBeforePaymentCreate:
            return "onBeforePaymentCreate"
        case .onClientSessionUpdate:
            return "onClientSessionUpdate"
        case .onPreparationStart:
            return "onPreparationStart"
        case .onPaymentMethodShow:
            return "onPaymentMethodShow"
        }
    }
}

@objc(PrimerHeadlessUniversalCheckout)
class RNTPrimerHeadlessUniversalCheckout: RCTEventEmitter {

    private var settings: PrimerSettings?
    private var primerWillCreatePaymentWithDataDecisionHandler: ((_ errorMessage: String?) -> Void)?
    private var primerDidTokenizePaymentMethodDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    private var primerDidResumeWithDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    private var implementedRNCallbacks: ImplementedRNCallbacks?
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override init() {
        super.init()
        PrimerHeadlessUniversalCheckout.current.delegate = self
        PrimerHeadlessUniversalCheckout.current.uiDelegate = self
    }
    
    override func supportedEvents() -> [String]! {
        return PrimerHeadlessUniversalCheckoutEvents.allCases.compactMap({ $0.stringValue })
    }
    
    // MARK: - API
    
    @objc
    public func startWithClientToken(_ clientToken: String,
                                     settingsStr: String?,
                                     resolver: @escaping RCTPromiseResolveBlock,
                                     rejecter: @escaping RCTPromiseRejectBlock)
    {
        do {
            var tmpSettings: PrimerSettings?
            if let settingsStr = settingsStr {
                tmpSettings = try PrimerSettings(settingsStr: settingsStr)
                self.settings = tmpSettings
            }
            
            PrimerHeadlessUniversalCheckout.current.start(
                withClientToken: clientToken,
                settings: settings,
                delegate: self,
                uiDelegate: self) { paymentMethods, err in
                    if let err = err {
                        rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
                    } else if let paymentMethods = paymentMethods {
                        let paymentMethodObjects = paymentMethods.compactMap({ $0.toJsonObject() })
                        resolver(["availablePaymentMethods": paymentMethodObjects])
                    }
                }
            
        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }
    
    @objc
    public func disposePrimerHeadlessUniversalCheckout() {
        
    }
    
    // MARK: - DECISION HANDLERS
    
    // MARK: Tokenization & Resume Handlers
    
    @objc
    public func handleTokenizationNewClientToken(_ newClientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(newClientToken, nil)
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            resolver(nil)
        }
    }
        
    @objc
    public func handleResumeWithNewClientToken(_ newClientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(newClientToken, nil)
            self.primerDidResumeWithDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handleCompleteFlow(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(nil, nil)
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
    
    // MARK: Helpers
    
    private func detectImplemetedCallbacks() {
        sendEvent(withName: PrimerEvents.detectImplementedRNCallbacks.stringValue, body: nil)
    }
    
    @objc
    public func setImplementedRNCallbacks(_ implementedRNCallbacksStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                guard let implementedRNCallbacksData = implementedRNCallbacksStr.data(using: .utf8) else {
<<<<<<< HEAD
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
=======
                    let err = RNTNativeError(
                        errorId: "native-ios",
                        errorDescription: "Failed to convert string to data",
                        recoverySuggestion: nil)
>>>>>>> feature/DEVX-409_HUC-Example-app
                    throw err
                }
                self.implementedRNCallbacks = try JSONDecoder().decode(ImplementedRNCallbacks.self, from: implementedRNCallbacksData)
                resolver(nil)
            } catch {
                self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: false)
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    private func handleRNBridgeError(_ error: Error, checkoutData: PrimerCheckoutData?, stopOnDebug: Bool) {
        DispatchQueue.main.async {
            if stopOnDebug {
                assertionFailure(error.localizedDescription)
            }
            
            var body: [String: Any] = ["error": error.rnError]
            if let checkoutData = checkoutData,
               let data = try? JSONEncoder().encode(checkoutData),
               let json = try? JSONSerialization.jsonObject(with: data){
                body["checkoutData"] = json
            }
            
            self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onError.stringValue, body: body)
        }
    }
}

// MARK: - EVENTS

extension RNTPrimerHeadlessUniversalCheckout: PrimerHeadlessUniversalCheckoutDelegate {
    
    // case onAvailablePaymentMethodsLoad = 0
    func primerHeadlessUniversalCheckoutDidLoadAvailablePaymentMethods(_ paymentMethods: [PrimerHeadlessUniversalCheckout.PaymentMethod]) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onAvailablePaymentMethodsLoad.stringValue
        
        DispatchQueue.main.async {
            self.sendEvent(
                withName: rnCallbackName,
                body: ["availablePaymentMethods": paymentMethods.compactMap({ $0.toJsonObject() })])
        }
    }
    
    // case onTokenizationStart
    func primerHeadlessUniversalCheckoutDidStartTokenization(for paymentMethodType: String) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onTokenizationStart.stringValue
        
        DispatchQueue.main.async {
            self.sendEvent(
                withName: rnCallbackName,
                body: ["paymentMethodType": paymentMethodType])
        }
    }
    
    // case onTokenizationSuccess
    func primerHeadlessUniversalCheckoutDidTokenizePaymentMethod(_ paymentMethodTokenData: PrimerPaymentMethodTokenData, decisionHandler: @escaping (PrimerHeadlessUniversalCheckoutResumeDecision) -> Void) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onTokenizationSuccess.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnTokenizationSuccessImplemented == true {
                self.primerDidTokenizePaymentMethodDecisionHandler = { (newClientToken, errorMessage) in
                    DispatchQueue.main.async {
                        if let newClientToken = newClientToken {
                            decisionHandler(.continueWithNewClientToken(newClientToken))
                        } else {
                            decisionHandler(.complete())
                        }
                    }
                }
                
                do {
                    let paymentMethodTokenJson = try paymentMethodTokenData.toJsonObject()
                    self.sendEvent(
                        withName: rnCallbackName,
                        body: ["paymentMethodTokenData": paymentMethodTokenJson])
                    
                } catch {
                    self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
                }
            } else {
                if self.settings?.paymentHandling == .manual {
                    let err = RNTNativeError(
<<<<<<< HEAD
                        errorId: "native-bridge",
                        errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                        recoverySuggestion: "Callback [\(rnCallbackName)] should be implemented.")
=======
                        errorId: "native-ios",
                        errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                        recoverySuggestion: "Callback [\(rnCallbackName)] must be implemented.")
>>>>>>> feature/DEVX-409_HUC-Example-app
                    self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
                }
            }
        }
    }
    
    // case onCheckoutResume
    func primerHeadlessUniversalCheckoutDidResumeWith(_ resumeToken: String, decisionHandler: @escaping (PrimerHeadlessUniversalCheckoutResumeDecision) -> Void) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onCheckoutResume.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnCheckoutResumeImplemented == true {
                self.primerDidResumeWithDecisionHandler = { (resumeToken, errorMessage) in
                    DispatchQueue.main.async {
                        if let resumeToken = resumeToken {
                            decisionHandler(.continueWithNewClientToken(resumeToken))
                        } else {
                            decisionHandler(.complete())
                        }
                    }
                }
                
                self.sendEvent(
                    withName: rnCallbackName,
                    body: ["resumeToken": resumeToken])
                
            } else {
                if self.settings?.paymentHandling == .manual {
                    let err = RNTNativeError(
<<<<<<< HEAD
                        errorId: "native-bridge",
                        errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                        recoverySuggestion: "Callback [\(rnCallbackName)] should be implemented.")
=======
                        errorId: "native-ios",
                        errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                        recoverySuggestion: "Callback [\(rnCallbackName)] must be implemented.")
>>>>>>> feature/DEVX-409_HUC-Example-app
                    self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
                }
            }
        }
    }
    
    // case onCheckoutPending
    func primerHeadlessUniversalCheckoutDidEnterResumePendingWithPaymentAdditionalInfo(_ additionalInfo: PrimerCheckoutAdditionalInfo?) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onCheckoutPending.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnCheckoutPendingImplemented == true {
                do {
                    let checkoutAdditionalInfoJson = try additionalInfo?.toJsonObject()
                    self.sendEvent(withName: rnCallbackName, body: checkoutAdditionalInfoJson)
                } catch {
                    let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
                    self.handleRNBridgeError(error, checkoutData: checkoutData, stopOnDebug: true)
                }
            } else {
                let err = RNTNativeError(
<<<<<<< HEAD
                    errorId: "native-bridge",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "Callback [\(rnCallbackName)] should be implemented.")
=======
                    errorId: "native-ios",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "Callback [\(rnCallbackName)] must be implemented.")
>>>>>>> feature/DEVX-409_HUC-Example-app
                
                let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
                self.handleRNBridgeError(err, checkoutData: checkoutData, stopOnDebug: false)
            }
        }
    }
    
    // case onCheckoutAdditionalInfo
    func primerHeadlessUniversalCheckoutDidReceiveAdditionalInfo(_ additionalInfo: PrimerCheckoutAdditionalInfo?) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onCheckoutAdditionalInfo.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnCheckoutAdditionalInfoImplemented == true {
                do {
                    let checkoutAdditionalInfoJson = try additionalInfo?.toJsonObject()
                    self.sendEvent(
                        withName: rnCallbackName,
                        body: checkoutAdditionalInfoJson)
                    
                } catch {
                    let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
                    self.handleRNBridgeError(error, checkoutData: checkoutData, stopOnDebug: true)
                }
            } else {
                let err = RNTNativeError(
                    errorId: "native-bridge",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "Callback [\(rnCallbackName)] should be implemented.")
                
                let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
                self.handleRNBridgeError(err, checkoutData: checkoutData, stopOnDebug: false)
            }
        }
    }
    
    // case onError
    func primerHeadlessUniversalCheckoutDidFail(withError err: Error, checkoutData: PrimerCheckoutData?) {
        if self.implementedRNCallbacks?.isOnErrorImplemented == true {
            // Send the error message to the RN bridge.
            self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)

        } else {
            // RN dev hasn't opted in on listening SDK errors.
            // Ignore!
        }
    }
    
    // case onCheckoutComplete
    func primerHeadlessUniversalCheckoutDidCompleteCheckoutWithData(_ data: PrimerCheckoutData) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onCheckoutComplete.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnCheckoutCompleteImplemented == true {
                do {
                    let checkoutJson = try data.toJsonObject()
                    self.sendEvent(withName: rnCallbackName, body: checkoutJson)
                } catch {
                    self.handleRNBridgeError(error, checkoutData: data, stopOnDebug: true)
                }
            } else {
                let err = RNTNativeError(
<<<<<<< HEAD
                    errorId: "native-bridge",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "Callback [\(rnCallbackName)] should be implemented.")
=======
                    errorId: "native-ios",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "Callback [\(rnCallbackName)] must be implemented.")
>>>>>>> feature/DEVX-409_HUC-Example-app
                self.handleRNBridgeError(err, checkoutData: data, stopOnDebug: false)
            }
        }
    }
    
    // case onBeforeClientSessionUpdate
    func primerHeadlessUniversalCheckoutWillUpdateClientSession() {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onBeforeClientSessionUpdate.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnBeforeClientSessionUpdateImplemented == true {
                self.sendEvent(
                    withName: rnCallbackName,
                    body: nil)
                
<<<<<<< HEAD
            } else {
                let err = RNTNativeError(
                    errorId: "native-bridge",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "[Optional] Consider implementing [\(rnCallbackName)].")
                self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
=======
>>>>>>> feature/DEVX-409_HUC-Example-app
            }
        }
    }
    
    // case onClientSessionUpdate
    func primerHeadlessUniversalCheckoutDidUpdateClientSession(_ clientSession: PrimerClientSession) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onClientSessionUpdate.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnClientSessionUpdateImplemented == true {
                do {
                    let json = try clientSession.toJsonObject()
                    self.sendEvent(
                        withName: rnCallbackName,
                        body: ["clientSession": json])
                    
                } catch {
                    self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
                }
                
<<<<<<< HEAD
            } else {
                let err = RNTNativeError(
                    errorId: "native-bridge",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "[Optional] Consider implementing [\(rnCallbackName)].")
                self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
=======
>>>>>>> feature/DEVX-409_HUC-Example-app
            }
        }
    }
    
    // case onBeforePaymentCreate
    func primerHeadlessUniversalCheckoutWillCreatePaymentWithData(_ data: PrimerCheckoutPaymentMethodData, decisionHandler: @escaping (PrimerPaymentCreationDecision) -> Void) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onBeforePaymentCreate.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnBeforePaymentCreateImplemented == true {
                self.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
                    DispatchQueue.main.async {
                        if let errorMessage = errorMessage {
                            decisionHandler(.abortPaymentCreation(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                        } else {
                            decisionHandler(.continuePaymentCreation())
                        }
                    }
                }

                do {
                    print("data: \(data)")
                    print("try data.toJsonObject(): \(try data.toJsonObject())")
                    let checkoutPaymentmethodJson = try data.toJsonObject()
                    self.sendEvent(
                        withName: rnCallbackName,
                        body: checkoutPaymentmethodJson)
                    
                } catch {
                    self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
                }
                
            } else {
<<<<<<< HEAD
                let err = RNTNativeError(
                    errorId: "native-bridge",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "[Optional] Consider implementing [\(rnCallbackName)] to handle the payment creation.")
                self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
                
                // RN Dev hasn't implemented this callback,continue the payment flow.
=======
                // 'primerHeadlessUniversalCheckoutWillCreatePaymentWithData' hasn't
                // been implemented on the RN side, continue the payment flow.
>>>>>>> feature/DEVX-409_HUC-Example-app
                decisionHandler(.continuePaymentCreation())
            }
        }
    }

}

extension RNTPrimerHeadlessUniversalCheckout: PrimerHeadlessUniversalCheckoutUIDelegate {
    
    // onPreparationStart
    func primerHeadlessUniversalCheckoutUIDidStartPreparation(for paymentMethodType: String) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onPreparationStart.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnPreparationStartImplemented == true {
                self.sendEvent(
                    withName: rnCallbackName,
                    body: ["paymentMethodType": paymentMethodType])
<<<<<<< HEAD
                
            } else {
                let err = RNTNativeError(
                    errorId: "native-bridge",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "[Optional] Consider implementing [\(rnCallbackName)] to get notified when the payment method is getting prepared to be presented.")
                self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
=======
>>>>>>> feature/DEVX-409_HUC-Example-app
            }
        }
    }
    
    func primerHeadlessUniversalCheckoutUIDidShowPaymentMethod(for paymentMethodType: String) {
        let rnCallbackName = PrimerHeadlessUniversalCheckoutEvents.onPaymentMethodShow.stringValue
        
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnPaymentMethodShowImplemented == true {
                self.sendEvent(
                    withName: rnCallbackName,
                    body: ["paymentMethodType": paymentMethodType])
                
<<<<<<< HEAD
            } else {
                let err = RNTNativeError(
                    errorId: "native-bridge",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "[Optional] Consider implementing [\(rnCallbackName)] to get notified when the payment method is getting presented.")
                self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
=======
>>>>>>> feature/DEVX-409_HUC-Example-app
            }
        }
    }
}
<<<<<<< HEAD
















//extension RNTPrimerHeadlessUniversalCheckout: PrimerHeadlessUniversalCheckoutDelegate {
//
//    func primerHeadlessUniversalCheckoutPreparationDidStart(for paymentMethodType: String) {
//        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onHUCPrepareStart.stringValue, body: ["paymentMethodType": paymentMethodType])
//    }
//
//    func primerHeadlessUniversalCheckoutTokenizationDidStart(for paymentMethodType: String) {
//        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onHUCTokenizeStart.stringValue, body: ["paymentMethodType": paymentMethodType])
//    }
//
//    func primerHeadlessUniversalCheckoutDidLoadAvailablePaymentMethods(_ paymentMethodTypes: [String]) {
//        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onHUCAvailablePaymentMethodsLoaded.stringValue, body: ["paymentMethodTypes": paymentMethodTypes])
//    }
//
//    func primerHeadlessUniversalCheckoutPaymentMethodDidShow(for paymentMethodType: String) {
//        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onHUCPaymentMethodShow.stringValue, body: ["paymentMethodType": paymentMethodType])
//    }
//
//    func primerHeadlessUniversalCheckoutDidTokenizePaymentMethod(_ paymentMethodTokenData: PrimerPaymentMethodTokenData, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
//        if self.implementedRNCallbacks?.isOnTokenizeSuccessImplemented == true {
//            self.primerDidTokenizePaymentMethodDecisionHandler = { (newClientToken, errorMessage) in
//                DispatchQueue.main.async {
//                    if let errorMessage = errorMessage {
//                        decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
//                    } else if let newClientToken = newClientToken {
//                        decisionHandler(.continueWithNewClientToken(newClientToken))
//                    } else {
//                        decisionHandler(.succeed())
//                    }
//                }
//            }
//
//            do {
//                let data = try JSONEncoder().encode(paymentMethodTokenData)
//                let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
//                DispatchQueue.main.async {
//                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onTokenizeSuccess.stringValue, body: json)
//                }
//            } catch {
//                self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
//            }
//        } else {
//            // RN dev hasn't opted in on listening the tokenization callback.
//            // Throw an error if it's the manual flow, ignore if it's the
//            // auto flow.
//        }
//    }
//
//    func primerHeadlessUniversalCheckoutDidResumeWith(_ resumeToken: String, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
//        if self.implementedRNCallbacks?.isOnResumeSuccessImplemented == true {
//            self.primerDidResumeWithDecisionHandler = { (resumeToken, errorMessage) in
//                DispatchQueue.main.async {
//                    if let errorMessage = errorMessage {
//                        decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
//                    } else if let resumeToken = resumeToken {
//                        decisionHandler(.continueWithNewClientToken(resumeToken))
//                    } else {
//                        decisionHandler(.succeed())
//                    }
//                }
//            }
//
//            DispatchQueue.main.async {
//                self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onResumeSuccess.stringValue, body: ["resumeToken": resumeToken])
//            }
//        } else {
//            // RN dev hasn't opted in on listening the tokenization callback.
//            // Throw an error if it's the manual flow.
//        }
//    }
//
//    func primerHeadlessUniversalCheckoutDidFail(withError err: Error) {
//        if self.implementedRNCallbacks?.isOnErrorImplemented == true {
//            // Send the error message to the RN bridge.
//            self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
//
//        } else {
//            // RN dev hasn't opted in on listening SDK dismiss.
//            // Ignore!
//        }
//    }
//
//    func primerHeadlessUniversalCheckoutDidCompleteCheckoutWithData(_ data: PrimerCheckoutData) {
//        DispatchQueue.main.async {
//            if self.implementedRNCallbacks?.isOnCheckoutCompleteImplemented == true {
//                do {
//                    let checkoutData = try JSONEncoder().encode(data)
//                    let checkoutJson = try JSONSerialization.jsonObject(with: checkoutData, options: .allowFragments)
//                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onCheckoutComplete.stringValue, body: checkoutJson)
//                } catch {
//                    self.handleRNBridgeError(error, checkoutData: data, stopOnDebug: true)
//                }
//            } else {
//                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onCheckoutComplete] should be implemented."])
//                self.handleRNBridgeError(err, checkoutData: data, stopOnDebug: false)
//            }
//        }
//    }
//
//    func primerHeadlessUniversalCheckoutDidEnterResumePendingWithPaymentAdditionalInfo(_ additionalInfo: PrimerCheckoutAdditionalInfo?) {
//        DispatchQueue.main.async {
//            if self.implementedRNCallbacks?.isOnResumePendingImplemented == true {
//                do {
//                    let checkoutAdditionalInfo = try JSONEncoder().encode(additionalInfo)
//                    let checkoutAdditionalInfoJson = try JSONSerialization.jsonObject(with: checkoutAdditionalInfo, options: .allowFragments)
//                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onResumePending.stringValue, body: checkoutAdditionalInfoJson)
//                } catch {
//                    let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
//                    self.handleRNBridgeError(error, checkoutData: checkoutData, stopOnDebug: true)
//                }
//            } else {
//                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onResumePending] should be implemented."])
//                let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
//                self.handleRNBridgeError(err, checkoutData: checkoutData, stopOnDebug: false)
//            }
//        }
//    }
//
//    func primerHeadlessUniversalCheckoutDidReceiveAdditionalInfo(_ additionalInfo: PrimerCheckoutAdditionalInfo?) {
//        DispatchQueue.main.async {
//            if self.implementedRNCallbacks?.isOnCheckoutReceivedAdditionalInfoImplemented == true {
//                do {
//                    let checkoutAdditionalInfo = try JSONEncoder().encode(additionalInfo)
//                    let checkoutAdditionalInfoJson = try JSONSerialization.jsonObject(with: checkoutAdditionalInfo, options: .allowFragments)
//                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onCheckoutReceivedAdditionalInfo.stringValue, body: checkoutAdditionalInfoJson)
//                } catch {
//                    let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
//                    self.handleRNBridgeError(error, checkoutData: checkoutData, stopOnDebug: true)
//                }
//            } else {
//                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onCheckoutReceivedAdditionalInfo] should be implemented."])
//                let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
//                self.handleRNBridgeError(err, checkoutData: checkoutData, stopOnDebug: false)
//            }
//        }
//    }
//
//    func primerHeadlessUniversalCheckoutClientSessionWillUpdate() {
//        if self.implementedRNCallbacks?.isOnBeforeClientSessionUpdateImplemented == true {
//            DispatchQueue.main.async {
//                self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onBeforeClientSessionUpdate.stringValue, body: nil)
//            }
//        } else {
//            // React Native app hasn't implemented this callback, ignore.
//        }
//    }
//
//    func primerHeadlessUniversalCheckoutClientSessionDidUpdate(_ clientSession: PrimerClientSession) {
//        if self.implementedRNCallbacks?.isOnClientSessionUpdateImplemented == true {
//            do {
//                let data = try JSONEncoder().encode(clientSession)
//                let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
//                DispatchQueue.main.async {
//                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onClientSessionUpdate.stringValue, body: json)
//                }
//            } catch {
//                self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
//            }
//        } else {
//            // RN Dev hasn't implemented this callback, ignore.
//        }
//    }
//
//    func primerHeadlessUniversalCheckoutWillCreatePaymentWithData(_ data: PrimerCheckoutPaymentMethodData, decisionHandler: @escaping (PrimerPaymentCreationDecision) -> Void) {
//        if self.implementedRNCallbacks?.isOnBeforePaymentCreateImplemented == true {
//            self.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
//                DispatchQueue.main.async {
//                    if let errorMessage = errorMessage {
//                        decisionHandler(.abortPaymentCreation(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
//                    } else {
//                        decisionHandler(.continuePaymentCreation())
//                    }
//                }
//            }
//
//            DispatchQueue.main.async {
//                do {
//                    let checkoutPaymentmethodData = try JSONEncoder().encode(data)
//                    let checkoutPaymentmethodJson = try JSONSerialization.jsonObject(with: checkoutPaymentmethodData, options: .allowFragments)
//                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onBeforePaymentCreate.stringValue, body: checkoutPaymentmethodJson)
//                } catch {
//                    self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
//                }
//            }
//        } else {
//            // RN Dev hasn't implemented this callback, send a decision to continue the flow.
//            DispatchQueue.main.async {
//                decisionHandler(.continuePaymentCreation())
//            }
//        }
//    }
//}


=======
>>>>>>> feature/DEVX-409_HUC-Example-app
