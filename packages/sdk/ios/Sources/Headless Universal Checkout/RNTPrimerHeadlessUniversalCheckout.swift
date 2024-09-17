//
//  RNTPrimerHeadlessUniversalCheckout.swift
//  primer-io-react-native
//
//  Created by Evangelos on 8/3/22.
//

import Foundation
import PrimerSDK
import PrimerStripeSDK
import React

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

    var settings: PrimerSettings?
    var primerWillCreatePaymentWithDataDecisionHandler: ((_ errorMessage: String?) -> Void)?
    var primerDidTokenizePaymentMethodDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    var primerDidResumeWithDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    var implementedRNCallbacks: ImplementedRNCallbacks?

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
    public func cleanUp(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            PrimerHeadlessUniversalCheckout.current.cleanUp()
            resolver(nil)
        }
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
                    let err = RNTNativeError(
                        errorId: "native-ios",
                        errorDescription: "Failed to convert string to data",
                        recoverySuggestion: nil)
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
                        errorId: "native-ios",
                        errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                        recoverySuggestion: "Callback [\(rnCallbackName)] must be implemented.")
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
                        errorId: "native-ios",
                        errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                        recoverySuggestion: "Callback [\(rnCallbackName)] must be implemented.")
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
                    errorId: "native-ios",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "Callback [\(rnCallbackName)] must be implemented.")

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
                    switch additionalInfo {
                        case let info as ACHBankAccountCollectorAdditionalInfo:
                            // Handled internally, nothing for merchant to handle
                            let keyWindow = UIApplication
                                .shared
                                .connectedScenes
                                .flatMap { ($0 as? UIWindowScene)?.windows ?? [] }
                                .last { $0.isKeyWindow }
                            DispatchQueue.main.async {
                                if let rootViewController = keyWindow?.rootViewController {
                                    rootViewController.present(info.collectorViewController, animated: true, completion: nil)
                                } else {
                                    let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
                                    self.handleRNBridgeError(
                                        RNTNativeError(
                                        errorId: "native-ios",
                                        errorDescription: "Failed to retrieve root view controller, cannot present Stripe view controller",
                                        recoverySuggestion: nil
                                        ),
                                        checkoutData: checkoutData,
                                        stopOnDebug: true
                                    )
                                }
                            }
                            return
                        case _ as ACHMandateAdditionalInfo:
                            self.sendEvent(
                                withName: rnCallbackName,
                                body: try AchAdditionalInfoDisplayMandateRN().toJsonObject()
                            )
                        case let info as MultibancoCheckoutAdditionalInfo:
                            self.sendEvent(
                                withName: rnCallbackName,
                                body: try MultibancoCheckoutAdditionalInfoRN(expiresAt: info.expiresAt, reference: info.reference, entity: info.entity).toJsonObject()
                            )
                        case let info as PromptPayCheckoutAdditionalInfo:
                            self.sendEvent(
                                withName: rnCallbackName,
                                body: try PromptPayCheckoutAdditionalInfoRN(expiresAt: info.expiresAt, qrCodeUrl: info.qrCodeUrl, qrCodeBase64: info.qrCodeBase64).toJsonObject()
                            )
                        case let info as XenditCheckoutVoucherAdditionalInfo:
                            self.sendEvent(
                                withName: rnCallbackName,
                                body: try XenditCheckoutVoucherAdditionalInfoRN(expiresAt: info.expiresAt, couponCode: info.couponCode, retailerName: info.retailerName).toJsonObject()
                            )
                        default:
                            self.sendEvent(
                                withName: rnCallbackName,
                                body: try additionalInfo?.toJsonObject()
                            )
                    }
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
            self.handleRNBridgeError(err, checkoutData: checkoutData, stopOnDebug: false)

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
                    errorId: "native-ios",
                    errorDescription: "Callback [\(rnCallbackName)] is not implemented.",
                    recoverySuggestion: "Callback [\(rnCallbackName)] must be implemented.")
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
                    let checkoutPaymentmethodJson = try data
                        .toPrimerCheckoutPaymentMethodDataRN()
                        .toJsonObject()
                    self.sendEvent(
                        withName: rnCallbackName,
                        body: checkoutPaymentmethodJson)

                } catch {
                    self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
                }

            } else {
                // 'primerHeadlessUniversalCheckoutWillCreatePaymentWithData' hasn't
                // been implemented on the RN side, continue the payment flow.
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
            }
        }
    }
}
