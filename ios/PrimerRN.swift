//
//  PrimerRN.swift
//  ReactNative
//
//  Created by Carl Eriksson on 10/08/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import UIKit
import PrimerSDK

typealias BasicCompletionBlock = ((Error?) -> Void)

@objc(PrimerRN)
class PrimerRN: NSObject {
    
    let encoder = JSONEncoder()
    
    override init() {
        encoder.outputFormatting = .prettyPrinted
    }

    var clientToken: String?
    var settings: PrimerSettingsRN?
    var theme: PrimerThemeRN?
    var flow: PrimerSessionFlow?
    var onTokenizeSuccessCallback: RCTResponseSenderBlock?
    var onVaultSuccessCallback: RCTResponseSenderBlock?
    var onDismissCallback: RCTResponseSenderBlock?
    var onPrimerErrorCallback: RCTResponseSenderBlock?
    var onResumeFlowCallback: BasicCompletionBlock?
    
    private var sdkWasInitialised = false
    private var haltExecution = false
    
    @objc func configureSettings(_ request: String) {
        do {
            let json = request.data(using: .utf8)!
            let settings = try JSONDecoder().decode(PrimerSettingsRN.self, from: json)
            self.settings = settings
        } catch {
            checkoutFailed(with: ExceptionTypeRN.ParseJsonFailed)
        }
    }

    @objc func configureTheme(_ request: String) {
        do {
            let json = request.data(using: .utf8)!
            let themeRN = try JSONDecoder().decode(PrimerThemeRN.self, from: json)
            self.theme = themeRN
        } catch {
            checkoutFailed(with: ExceptionTypeRN.ParseJsonFailed)
        }
    }
    
    @objc func configureIntent(_ request: String) {
        do {
            let json = request.data(using: .utf8)!
            let intent = try JSONDecoder().decode(PrimerIntentRN.self, from: json)
            self.flow = intent.toPrimerSessionFlow()
        } catch {
            print("🔥🔥🔥")
            checkoutFailed(with: ExceptionTypeRN.ParseJsonFailed)
        }
    }
    
    @objc func configureOnTokenizeSuccess(_ callback: @escaping RCTResponseSenderBlock) {
        self.onTokenizeSuccessCallback = callback
    }
    
    @objc func configureOnVaultSuccess(_ callback: @escaping RCTResponseSenderBlock) {
        self.onVaultSuccessCallback = callback
    }

    @objc func configureOnDismiss(_ callback: @escaping RCTResponseSenderBlock) {
        self.onDismissCallback = callback
    }

    @objc func configureOnPrimerError(_ callback: @escaping RCTResponseSenderBlock) {
        self.onPrimerErrorCallback = callback
    }
    
    @objc func fetchSavedPaymentInstruments(_ token: String, with callback: @escaping RCTResponseSenderBlock) {
        
        self.clientToken = token
        
        Primer.shared.fetchVaultedPaymentMethods { [weak self] result in
            switch result {
            case .failure(let error):
                self?.checkoutFailed(with: error)
            case .success(let tokens):
                do {
                    let json = try self?.encoder.encode(tokens)
                    let data = String(data: json!, encoding: .utf8)!
                    callback([data])
                } catch {
                    self?.checkoutFailed(with: error)
                }
            }
        }
    }
    
    @objc func initialize(_ token: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                guard let viewController = RCTPresentedViewController() else {
                    throw ExceptionTypeRN.noIosViewController
                }

                guard let flow = self?.flow else {
                    throw ExceptionTypeRN.invalidPrimerIntent
                }
                
                guard
                    let settings = self?.settings?.asPrimerSettings(),
                    let theme = self?.theme?.asPrimerTheme()
                else {
                    throw ExceptionTypeRN.settingsNotConfigured
                }
                
                self?.clientToken = token
                
                Primer.shared.delegate = self
                Primer.shared.configure(settings: settings, theme: theme)
                Primer.shared.showCheckout(viewController, flow: flow)
                
            } catch {
                self?.checkoutFailed(with: error)
            }
        }
    }
    
    @objc func resume(_ request: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                let json = request.data(using: .utf8)!
                let request = try JSONDecoder().decode(PrimerResumeRequest.self, from: json)
                
                self?.clientToken = request.token
                
                switch request.intent {
                case "showError": self?.onResumeFlowCallback?(ExceptionTypeRN.ParseJsonFailed)
                default:  self?.onResumeFlowCallback?(nil)
                }
            } catch {
                self?.checkoutFailed(with: error)
            }
        }
    }
    
    @objc func dispose() -> Void {
        
    }
}

extension PrimerRN: PrimerDelegate {

    func clientTokenCallback(_ completion: @escaping (String?, Error?) -> Void) {
        guard let clientToken = clientToken else {
            checkoutFailed(with: ExceptionTypeRN.clientTokenNotConfigured)
            completion(nil, ExceptionTypeRN.clientTokenNotConfigured)
            return
        }
        completion(clientToken, nil)
    }
    
    func onTokenizeSuccess(_ paymentMethodToken: PaymentMethodToken, _ completion: @escaping (Error?) -> Void) {
        do {
            let json = try encoder.encode(paymentMethodToken)
            let data = String(data: json, encoding: .utf8)!
            self.onTokenizeSuccessCallback?([data])
        } catch {
            checkoutFailed(with: ExceptionTypeRN.ParseJsonFailed)
        }
        onResumeFlowCallback = completion
    }
    
    func tokenAddedToVault(_ token: PaymentMethodToken) {
        do {
            let json = try encoder.encode(token)
            let data = String(data: json, encoding: .utf8)!
            self.onVaultSuccessCallback?([data])
        } catch {
            checkoutFailed(with: ExceptionTypeRN.ParseJsonFailed)
        }
    }
    
    func onCheckoutDismissed() {
        print("\(#function): dismissing")
        self.onDismissCallback?([])
    }
    
    func checkoutFailed(with error: Error) {
        print("\(#function): \(error)")
        do {
            if let error = error as? ExceptionTypeRN {
                let exception = PrimerExceptionRN(exceptionType: error, description: nil)
                let json = try encoder.encode(exception)
                let data = String(data: json, encoding: .utf8)!
                self.onPrimerErrorCallback?([data])
            } else {
                self.onPrimerErrorCallback?(["{\"exceptionType\":\"CheckoutFlowFailed\"}"])
            }
        } catch {
            self.onPrimerErrorCallback?(["{\"exceptionType\":\"ParseJsonFailed\"}"])
        }
        haltExecution = true
    }
}
