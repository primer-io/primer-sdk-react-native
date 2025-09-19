//
//  Primer.swift
//  primer-io-react-native
//
//  Created by Evangelos on 15/3/22.
//

import Foundation
import PrimerSDK
import UIKit
import React

// swiftlint:disable file_length
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

// swiftlint:disable type_body_length
@objc public class RNTPrimer: NSObject {
    // swiftlint:disable identifier_name
    var primerWillCreatePaymentWithDataDecisionHandler: ((_ errorMessage: String?) -> Void)?
    var primerDidTokenizePaymentMethodDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    // swiftlint:enable identifier_name
    var primerDidResumeWithDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    var primerDidFailWithErrorDecisionHandler: ((_ errorMessage: String) -> Void)?
    var implementedRNCallbacks: ImplementedRNCallbacks?

    // MARK: - INITIALIZATION & REACT NATIVE SUPPORT

  private lazy var primerDelegate: PrimerDelegate = {
          class InlinePrimerDelegate: NSObject, PrimerDelegate {
              weak var parent: RNTPrimer?

              func primerDidCompleteCheckoutWithData(_ data: PrimerCheckoutData) {
                  DispatchQueue.main.async {
                      if self.parent?.implementedRNCallbacks?.isOnCheckoutCompleteImplemented == true {
                          do {
                              let checkoutData = try JSONEncoder().encode(data)
                              let checkoutJson = try JSONSerialization.jsonObject(with: checkoutData, options: .allowFragments)
                              self.parent?.eventDelegate?.sendEvent(withName: PrimerEvents.onCheckoutComplete.stringValue, body: checkoutJson)
                          } catch {
                              self.parent?.handleRNBridgeError(error, checkoutData: data, stopOnDebug: true)
                          }
                      } else {
                          let err = RNTNativeError(
                              errorId: "native-ios",
                              errorDescription: "Callback [onCheckoutComplete] should be implemented.",
                              recoverySuggestion: nil)
                          self.parent?.handleRNBridgeError(err, checkoutData: data, stopOnDebug: false)
                      }
                  }
              }

              func primerDidEnterResumePendingWithPaymentAdditionalInfo(_ additionalInfo: PrimerCheckoutAdditionalInfo?) {
                  DispatchQueue.main.async {
                      if self.parent?.implementedRNCallbacks?.isOnCheckoutResumeImplemented == true {
                          do {
                              let checkoutAdditionalInfo = try JSONEncoder().encode(additionalInfo)
                              let checkoutAdditionalInfoJson = try JSONSerialization.jsonObject(
                                  with: checkoutAdditionalInfo,
                                  options: .allowFragments
                              )
                              self.parent?.eventDelegate?.sendEvent(
                                  withName: PrimerHeadlessUniversalCheckoutEvents.onCheckoutPending.stringValue,
                                  body: checkoutAdditionalInfoJson
                              )
                          } catch {
                              let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
                              self.parent?.handleRNBridgeError(error, checkoutData: checkoutData, stopOnDebug: true)
                          }
                      } else {
                          let err = RNTNativeError(
                              errorId: "native-ios",
                              errorDescription: "Callback [onResumePending] should be implemented.",
                              recoverySuggestion: nil)
                          let checkoutData = PrimerCheckoutData(payment: nil, additionalInfo: additionalInfo)
                          self.parent?.handleRNBridgeError(err, checkoutData: checkoutData, stopOnDebug: false)
                      }
                  }
              }

              func primerWillCreatePaymentWithData(_ data: PrimerCheckoutPaymentMethodData, decisionHandler: @escaping (PrimerPaymentCreationDecision) -> Void) {
                  if self.parent?.implementedRNCallbacks?.isOnBeforePaymentCreateImplemented == true {
                      self.parent?.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
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
                              let checkoutPaymentmethodJson = try data.toPrimerCheckoutPaymentMethodDataRN().toJsonObject()
                              self.parent?.eventDelegate?.sendEvent(
                                  withName: PrimerEvents.onBeforePaymentCreate.stringValue,
                                  body: checkoutPaymentmethodJson
                              )
                          } catch {
                              self.parent?.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
                          }
                      }
                  } else {
                      DispatchQueue.main.async {
                          decisionHandler(.continuePaymentCreation())
                      }
                  }
              }

              func primerClientSessionWillUpdate() {
                  if self.parent?.implementedRNCallbacks?.isOnBeforeClientSessionUpdateImplemented == true {
                      DispatchQueue.main.async {
                          self.parent?.eventDelegate?.sendEvent(withName: PrimerEvents.onBeforeClientSessionUpdate.stringValue, body: nil)
                      }
                  }
              }

              func primerClientSessionDidUpdate(_ clientSession: PrimerClientSession) {
                  if self.parent?.implementedRNCallbacks?.isOnClientSessionUpdateImplemented == true {
                      do {
                          let data = try JSONEncoder().encode(clientSession)
                          let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
                          DispatchQueue.main.async {
                              self.parent?.eventDelegate?.sendEvent(withName: PrimerEvents.onClientSessionUpdate.stringValue, body: json)
                          }
                      } catch {
                          self.parent?.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
                      }
                  }
              }

              func primerDidTokenizePaymentMethod(_ paymentMethodTokenData: PrimerPaymentMethodTokenData, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
                  if self.parent?.implementedRNCallbacks?.isOnTokenizationSuccessImplemented == true {
                      self.parent?.primerDidTokenizePaymentMethodDecisionHandler = { (newClientToken, errorMessage) in
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
                              self.parent?.eventDelegate?.sendEvent(withName: PrimerEvents.onTokenizeSuccess.stringValue, body: json)
                          }
                      } catch {
                          self.parent?.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
                      }
                  }
              }

              func primerDidResumeWith(_ resumeToken: String, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
                  if self.parent?.implementedRNCallbacks?.isOnCheckoutResumeImplemented == true {
                      self.parent?.primerDidResumeWithDecisionHandler = { (resumeToken, errorMessage) in
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
                          self.parent?.eventDelegate?.sendEvent(withName: PrimerEvents.onResumeSuccess.stringValue, body: ["resumeToken": resumeToken])
                      }
                  }
              }

              func primerDidDismiss() {
                  if self.parent?.implementedRNCallbacks?.isOnDismissImplemented == true {
                      DispatchQueue.main.async {
                          self.parent?.eventDelegate?.sendEvent(withName: PrimerEvents.onDismiss.stringValue, body: nil)
                      }
                  }
              }

              func primerDidFailWithError(_ error: Error, data: PrimerCheckoutData?, decisionHandler: @escaping ((PrimerErrorDecision) -> Void)) {
                  if self.parent?.implementedRNCallbacks?.isOnErrorImplemented == true {
                      self.parent?.primerDidFailWithErrorDecisionHandler = { errorMessage in
                          DispatchQueue.main.async {
                              decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                          }
                      }
                      self.parent?.handleRNBridgeError(error, checkoutData: data, stopOnDebug: false)
                  }
              }
          }

          let delegate = InlinePrimerDelegate()
          delegate.parent = self
          return delegate
      }()

    deinit {
        print("🧨 deinit: \(self) \(Unmanaged.passUnretained(self).toOpaque())")
    }

    override init() {
        super.init()
        Primer.shared.delegate = primerDelegate
        Primer.shared.integrationOptions = PrimerIntegrationOptions(reactNativeVersion: PrimerReactNativeSDKVersion)
    }

    // MARK: - SDK API

    @objc
    public func configure(
        _ settingsStr: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
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
    public func showUniversalCheckoutWithClientToken(
        _ clientToken: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
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
    public func showVaultManagerWithClientToken(
        _ clientToken: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
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
    public func showPaymentMethod(
        _ paymentMethod: String,
        intent: String,
        clientToken: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
      DispatchQueue.main.async(qos: .userInitiated, flags: []) {
        guard let primerIntent = PrimerSessionIntent(rawValue: intent.uppercased()) else {
            let err = PrimerError.invalidValue(
                key: "intent",
                value: intent,
                diagnosticsId: UUID().uuidString
            )
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
            return
        }

        PrimerSDK.Primer.shared.showPaymentMethod(
            paymentMethod,
            intent: primerIntent,
            clientToken: clientToken
        ) { err in
            if let err = err {
                rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
            } else {
                resolver(nil)
            }
        }
      }
    }

    @objc
    public func dismiss() {
        Primer.shared.dismiss()
    }

    @objc
    public func cleanUp() {
        Primer.shared.dismiss()
    }

    // MARK: - DECISION HANDLERS

    // MARK: Tokenization

    @objc
    public func handleTokenizationNewClientToken(
        _ newClientToken: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(newClientToken, nil)
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            resolver(nil)
        }
    }

    @objc
    public func handleTokenizationSuccess(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(nil, nil)
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            resolver(nil)
        }
    }

    @objc
    public func handleTokenizationFailure(
        _ errorMessage: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(nil, errorMessage ?? "")
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            resolver(nil)
        }
    }

    // MARK: Resume Payment

    @objc
    public func handleResumeWithNewClientToken(
        _ newClientToken: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(newClientToken, nil)
            self.primerDidResumeWithDecisionHandler = nil
            resolver(nil)
        }
    }

    @objc
    public func handleResumeSuccess(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(nil, nil)
            self.primerDidResumeWithDecisionHandler = nil
            resolver(nil)
        }
    }

    @objc
    public func handleResumeFailure(
        _ errorMessage: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(nil, errorMessage ?? "")
            self.primerDidResumeWithDecisionHandler = nil
            resolver(nil)
        }
    }

    // MARK: Payment Creation

    @objc
    public func handlePaymentCreationAbort(
        _ errorMessage: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerWillCreatePaymentWithDataDecisionHandler?(errorMessage ?? "")
            self.primerWillCreatePaymentWithDataDecisionHandler = nil
            resolver(nil)
        }
    }

    @objc
    public func handlePaymentCreationContinue(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerWillCreatePaymentWithDataDecisionHandler?(nil)
            self.primerWillCreatePaymentWithDataDecisionHandler = nil
            resolver(nil)
        }
    }

    // MARK: Error Handler

    @objc
    public func showErrorMessage(
        _ errorMessage: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        DispatchQueue.main.async {
            self.primerDidFailWithErrorDecisionHandler?(errorMessage ?? "")
            self.primerDidFailWithErrorDecisionHandler = nil
            resolver(nil)
        }
    }

    // MARK: Helpers

    private func configure(settingsStr: String? = nil) throws {
        try PrimerSDK.Primer.shared.configure(settings: PrimerSettings(settingsStr: settingsStr), delegate: primerDelegate)
    }

    private func detectImplemetedCallbacks() {
      self.eventDelegate?.sendEvent(withName: PrimerEvents.detectImplementedRNCallbacks.stringValue, body: nil)
    }

    @objc
    public func setImplementedRNCallbacks(
        _ implementedRNCallbacksStr: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
            do {
                guard let implementedRNCallbacksData = implementedRNCallbacksStr.data(using: .utf8) else {
                    let err = RNTNativeError(
                        errorId: "native-ios",
                        errorDescription: "Failed to convert string to data",
                        recoverySuggestion: nil)
                    throw err
                }

                self.implementedRNCallbacks = try JSONDecoder().decode(
                    ImplementedRNCallbacks.self,
                    from: implementedRNCallbacksData
                )
                resolver(nil)
            } catch {
              handleRNBridgeError(error, checkoutData: nil, stopOnDebug: false)
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
    }

    // In RNTPrimer.swift, add this property
    @objc public weak var eventDelegate: RCTNativePrimer?

    private func handleRNBridgeError(_ error: Error, checkoutData: PrimerCheckoutData?, stopOnDebug: Bool) {
        DispatchQueue.main.async {
            if stopOnDebug {
                assertionFailure(error.localizedDescription)
            }

            var body: [String: Any] = ["error": error.rnError]
            if let checkoutData = checkoutData,
               let data = try? JSONEncoder().encode(checkoutData),
               let json = try? JSONSerialization.jsonObject(with: data) {
                body["checkoutData"] = json
            }
            if self.eventDelegate != nil {
              self.eventDelegate?.sendEvent(withName: PrimerEvents.onError.stringValue, body: body)
            } else {
                print("Bridge is not set")
            }
        }
    }

}
// swiftlint:enable type_body_length

// MARK: - PRIMER DELEGATE

// swiftlint:enable file_length
