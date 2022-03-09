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
    case clientSessionDidSetUpSuccessfully = 0
    case preparationStarted
    case paymentMethodPresented
    case tokenizationStarted
    case tokenizationSucceeded
    case resume
    case error
    
    var stringValue: String {
        switch self {
        case .clientSessionDidSetUpSuccessfully:
            return "clientSessionDidSetUpSuccessfully"
        case .preparationStarted:
            return "preparationStarted"
        case .paymentMethodPresented:
            return "paymentMethodPresented"
        case .tokenizationStarted:
            return "tokenizationStarted"
        case .tokenizationSucceeded:
            return "tokenizationSucceeded"
        case .resume:
            return "resume"
        case .error:
            return "error"
        }
    }
}

@objc(PrimerHeadlessUniversalCheckout)
class RNTPrimerHeadlessUniversalCheckout: RCTEventEmitter {
    
    override init() {
        super.init()
        PrimerHeadlessUniversalCheckout.current.delegate = self
    }
    
    override func supportedEvents() -> [String]! {
        return PrimerHeadlessUniversalCheckoutEvents.allCases.compactMap({ $0.stringValue })
    }

    @objc
    func startWithClientToken(_ clientToken: String,
                              settingsStr: String?,
                              errorCallback: @escaping RCTResponseErrorBlock,
                              successCallback: @escaping RCTResponseSenderBlock)
    {
        var settings: PrimerSettings?
        if let settingsStr = settingsStr {
            do {
                let settingsData = settingsStr.data(using: .utf8)!
                let settingsRN = try JSONDecoder().decode(PrimerSettingsRN.self, from: settingsData)
                settings = settingsRN.asPrimerSettings()
            } catch {
                errorCallback(error)
                return
            }
        }
        
        print(settings)
        
        PrimerHeadlessUniversalCheckout.current.start(withClientToken: clientToken, settings: settings, delegate: self) { paymentMethodTypes, err in
            if let err = err {
                errorCallback(err)
            } else if let paymentMethodTypes = paymentMethodTypes {
                successCallback([paymentMethodTypes.compactMap({$0.rawValue})])
            }
        }
    }
    
    @objc
    func showPaymentMethod(_ paymentMethodTypeStr: String) {
        let paymentMethodType = PrimerPaymentMethodType(rawValue: paymentMethodTypeStr)
        PrimerHeadlessUniversalCheckout.current.showPaymentMethod(paymentMethodType)
    }
    
}

extension RNTPrimerHeadlessUniversalCheckout: PrimerHeadlessUniversalCheckoutDelegate {
    func primerHeadlessUniversalCheckoutClientSessionDidSetUpSuccessfully() {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.clientSessionDidSetUpSuccessfully.stringValue, body: nil)
    }
    
    func primerHeadlessUniversalCheckoutPreparationStarted() {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.preparationStarted.stringValue, body: nil)
    }
    
    func primerHeadlessUniversalCheckoutTokenizationStarted() {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.tokenizationStarted.stringValue, body: nil)
    }
    
    func primerHeadlessUniversalCheckoutPaymentMethodPresented() {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.paymentMethodPresented.stringValue, body: nil)
    }
    
    func primerHeadlessUniversalCheckoutTokenizationSucceeded(paymentMethodToken: PaymentMethodToken, resumeHandler: ResumeHandlerProtocol?) {
        do {
            let paymentMethodTokenData = try JSONEncoder().encode(paymentMethodToken)
            let paymentMethodTokenStr = String(data: paymentMethodTokenData, encoding: .utf8)!
            sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.tokenizationSucceeded.stringValue, body: ["paymentMethodToken": paymentMethodTokenStr])

        } catch {
            self.primerHeadlessUniversalCheckoutUniversalCheckoutDidFail(withError: error)
        }
    }
    
    func primerHeadlessUniversalCheckoutResume(withResumeToken resumeToken: String, resumeHandler: ResumeHandlerProtocol?) {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.resume.stringValue, body: ["resumeToken": resumeToken])
    }
    
    func primerHeadlessUniversalCheckoutUniversalCheckoutDidFail(withError err: Error) {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.error.stringValue, body: ["error": err.localizedDescription])
    }
}
