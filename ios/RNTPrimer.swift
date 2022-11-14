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

    case onCheckoutComplete = 0
    case onBeforeClientSessionUpdate
    case onClientSessionUpdate
    case onBeforePaymentCreate
    case onDismiss
    case onTokenizeSuccess
    case onResumeSuccess
    case onResumePending
    case onCheckoutReceivedAdditionalInfo
    case onError
    case detectImplementedRNCallbacks

    var stringValue: String {
        switch self {
        case .onCheckoutComplete:
            return "onCheckoutComplete"
        case .onBeforeClientSessionUpdate:
            return "onBeforeClientSessionUpdate"
        case .onClientSessionUpdate:
            return "onClientSessionUpdate"
        case .onBeforePaymentCreate:
            return "onBeforePaymentCreate"
        case .onDismiss:
            return "onDismiss"
        case .onTokenizeSuccess:
            return "onTokenizeSuccess"
        case .onResumeSuccess:
            return "onResumeSuccess"
        case .onResumePending:
            return "onResumePending"
        case .onCheckoutReceivedAdditionalInfo:
            return "onCheckoutReceivedAdditionalInfo"
        case .onError:
            return "onError"
        case .detectImplementedRNCallbacks:
            return "detectImplementedRNCallbacks"
        }
    }
}

@objc(NativePrimer)
class RNTPrimer: RCTEventEmitter {

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
        PrimerSDK.Primer.shared.integrationOptions = PrimerIntegrationOptions(reactNativeVersion: "2.14.4")
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
    public func showPaymentMethod(_ paymentMethodTypeStr: String, intent: String, clientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                guard let primerIntent = PrimerSessionIntent(rawValue: intent) else {
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Intent \(intent) is not valid."])
                    throw err
                }

                PrimerSDK.Primer.shared.showPaymentMethod(paymentMethodTypeStr, withIntent: primerIntent, andClientToken: clientToken) { err in
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

    @objc
    public func dispose() {
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
    public func showErrorMessage(_ errorMessage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidFailWithErrorDecisionHandler?(errorMessage ?? "")
            self.primerDidFailWithErrorDecisionHandler = nil
            resolver(nil)
        }
    }

    // MARK: Helpers

    private func configure(settingsStr: String? = nil) throws {
        try PrimerSDK.Primer.shared.configure(settings: PrimerSettings.initialize(with: settingsStr), delegate: self)
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
            print(body)
            self.sendEvent(withName: PrimerEvents.onError.stringValue, body: body)
        }
    }
}

// MARK: - PRIMER DELEGATE

extension RNTPrimer: PrimerDelegate {

    func primerDidCompleteCheckoutWithData(_ data: PrimerCheckoutData) {
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnCheckoutCompleteImplemented == true {
                do {
                    let checkoutData = try JSONEncoder().encode(data)
                    let checkoutJson = try JSONSerialization.jsonObject(with: checkoutData, options: .allowFragments)
                    self.sendEvent(withName: PrimerEvents.onCheckoutComplete.stringValue, body: checkoutJson)
                } catch {
                    self.handleRNBridgeError(error, checkoutData: data, stopOnDebug: true)
                }
            } else {
                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onCheckoutComplete] should be implemented."])
                self.handleRNBridgeError(err, checkoutData: data, stopOnDebug: false)
            }
        }
    }

    func primerDidEnterResumePendingWithPaymentAdditionalInfo(_ additionalInfo: PrimerCheckoutAdditionalInfo?) {
      DispatchQueue.main.async {
          if self.implementedRNCallbacks?.isOnResumePendingImplemented == true {
              do {
                  let checkoutAdditionalInfo = try JSONEncoder().encode(additionalInfo)
                  let checkoutAdditionalInfoJson = try JSONSerialization.jsonObject(with: checkoutAdditionalInfo, options: .allowFragments)
                  self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onResumePending.stringValue, body: checkoutAdditionalInfoJson)
              } catch {
                  let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
                  self.handleRNBridgeError(error, checkoutData: checkoutData, stopOnDebug: true)
              }
          } else {
              let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onResumePending] should be implemented."])
              let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
              self.handleRNBridgeError(err, checkoutData: checkoutData, stopOnDebug: false)
          }
      }
    }


    func primerWillCreatePaymentWithData(_ data: PrimerCheckoutPaymentMethodData, decisionHandler: @escaping (PrimerPaymentCreationDecision) -> Void) {
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

            DispatchQueue.main.async {
                do {
                    let checkoutPaymentmethodData = try JSONEncoder().encode(data)
                    let checkoutPaymentmethodJson = try JSONSerialization.jsonObject(with: checkoutPaymentmethodData, options: .allowFragments)
                    self.sendEvent(withName: PrimerEvents.onBeforePaymentCreate.stringValue, body: checkoutPaymentmethodJson)
                } catch {
                    self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
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
        if self.implementedRNCallbacks?.isOnBeforeClientSessionUpdateImplemented == true {
            DispatchQueue.main.async {
                self.sendEvent(withName: PrimerEvents.onBeforeClientSessionUpdate.stringValue, body: nil)
            }
        } else {
            // RN Dev hasn't implemented this callback, ignore.
        }
    }

    func primerClientSessionDidUpdate(_ clientSession: PrimerClientSession) {
        if self.implementedRNCallbacks?.isOnClientSessionUpdateImplemented == true {
            do {
                let data = try JSONEncoder().encode(clientSession)
                let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
                DispatchQueue.main.async {
                    self.sendEvent(withName: PrimerEvents.onClientSessionUpdate.stringValue, body: json)
                }
            } catch {
                self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
            }
        } else {
            // RN Dev hasn't implemented this callback, ignore.
        }
    }

    func primerDidTokenizePaymentMethod(_ paymentMethodTokenData: PrimerPaymentMethodTokenData, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
        if self.implementedRNCallbacks?.isOnTokenizeSuccessImplemented == true {
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
                    self.sendEvent(withName: PrimerEvents.onTokenizeSuccess.stringValue, body: json)
                }
            } catch {
                self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
            }
        } else {
            // RN dev hasn't opted in on listening the tokenization callback.
            // Throw an error if it's the manual flow, ignore if it's the
            // auto flow.
        }
    }

    func primerDidResumeWith(_ resumeToken: String, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
        if self.implementedRNCallbacks?.isOnResumeSuccessImplemented == true {
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
                self.sendEvent(withName: PrimerEvents.onResumeSuccess.stringValue, body: ["resumeToken": resumeToken])
            }
        } else {
            // RN dev hasn't opted in on listening the tokenization callback.
            // Throw an error if it's the manual flow.
        }
    }

    func primerDidDismiss() {
        if self.implementedRNCallbacks?.isOnDismissImplemented == true {
            DispatchQueue.main.async {
                self.sendEvent(withName: PrimerEvents.onDismiss.stringValue, body: nil)
            }
        } else {
            // RN dev hasn't opted in on listening SDK dismiss.
            // Ignore!
        }
    }

    func primerDidFailWithError(_ error: Error, data: PrimerCheckoutData?, decisionHandler: @escaping ((PrimerErrorDecision) -> Void)) {
        if self.implementedRNCallbacks?.isOnErrorImplemented == true {
            // Set up the callback that will be called by **handleErrorMessage** when the RN
            // bridge invokes it.
            self.primerDidFailWithErrorDecisionHandler = { errorMessage in
                // Callback was called by **handleErrorMessage**.
                DispatchQueue.main.async {
                    decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                }
            }

            // Send the error message to the RN bridge.
            self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: false)

        } else {
            // RN dev hasn't opted in on listening SDK dismiss.
            // Ignore!
        }
    }
}
