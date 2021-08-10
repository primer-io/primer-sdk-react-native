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
    var settings: PrimerSettings?
    var theme: PrimerTheme?
    var onTokenizeSuccessCallback: RCTResponseSenderBlock?
    var onVaultSuccessCallback: RCTResponseSenderBlock?
    var onDismissCallback: RCTResponseSenderBlock?
    var onPrimerErrorCallback: RCTResponseSenderBlock?
    var onResumeFlowCallback: BasicCompletionBlock?
    
    @objc func configureSettings(_ data: String) {
        do {
            let json = data.data(using: .utf8)!
            let settings = try JSONDecoder().decode(PrimerSettingsRN.self, from: json)
            self.settings = settings.asPrimerSettings()
        } catch {
            checkoutFailed(with: PrimerExceptionRN.settingsParsingFailed)
        }
    }

    @objc func configureTheme(_ data: String) {
        do {
            let json = data.data(using: .utf8)!
            let themeRN = try JSONDecoder().decode(PrimerThemeRN.self, from: json)
            self.theme = themeRN.asPrimerTheme()
        } catch {
            checkoutFailed(with: PrimerExceptionRN.themeParsingFailed)
        }
    }
    
    @objc func configureOnTokenizeSuccessCallback(_ callback: @escaping RCTResponseSenderBlock) {
        print("\(#function)")
        self.onTokenizeSuccessCallback = callback
    }
    
    @objc func configureOnVaultSuccessCallback(_ callback: @escaping RCTResponseSenderBlock) {
        print("\(#function)")
        self.onVaultSuccessCallback = callback
    }

    @objc func configureOnDismissCallback(_ callback: @escaping RCTResponseSenderBlock) {
        print("\(#function)")
        self.onDismissCallback = callback
    }

    @objc func configureOnPrimerErrorCallback(_ callback: @escaping RCTResponseSenderBlock) {
        print("\(#function)")
        self.onPrimerErrorCallback = callback
    }
    
    @objc func fetchSavedPaymentInstruments(_ callback: @escaping RCTResponseSenderBlock) {
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
    
    @objc func initWith(_ data: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                let json = data.data(using: .utf8)!
                let request = try JSONDecoder().decode(PrimerInitRequest.self, from: json)
                
                guard let viewController = RCTPresentedViewController() else {
                    throw PrimerExceptionRN.noViewController
                }

                guard let flow = PrimerFlowRN.fromString(request.intent) else {
                    throw PrimerExceptionRN.invalidPrimerIntent
                }
                
                guard let settings = self?.settings, let theme = self?.theme else {
                    throw PrimerExceptionRN.settingsNotConfigured
                }
                
                self?.clientToken = request.token
                
                Primer.shared.delegate = self
                Primer.shared.configure(settings: settings, theme: theme)
                Primer.shared.showCheckout(viewController, flow: flow)
                
            } catch {
                self?.checkoutFailed(with: error)
            }
        }
    }
    
    @objc func resumeWith(_ data: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                let json = data.data(using: .utf8)!
                let request = try JSONDecoder().decode(PrimerResumeRequest.self, from: json)
                
                self?.clientToken = request.token
                
                switch request.intent {
                case "showError": self?.onResumeFlowCallback?(PrimerExceptionRN.tokenParsingFailed)
                default:  self?.onResumeFlowCallback?(nil)
                }
            } catch {
                self?.checkoutFailed(with: error)
            }
        }
    }
}

extension PrimerRN: PrimerDelegate {

    func clientTokenCallback(_ completion: @escaping (String?, Error?) -> Void) {
        guard let clientToken = clientToken else {
            checkoutFailed(with: PrimerExceptionRN.clientTokenNotConfigured)
            completion(nil, PrimerExceptionRN.clientTokenNotConfigured)
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
            checkoutFailed(with: PrimerExceptionRN.tokenParsingFailed)
        }
        onResumeFlowCallback = completion
    }
    
    func tokenAddedToVault(_ token: PaymentMethodToken) {
        do {
            let json = try encoder.encode(token)
            let data = String(data: json, encoding: .utf8)!
            self.onVaultSuccessCallback?([data])
        } catch {
            checkoutFailed(with: PrimerExceptionRN.tokenParsingFailed)
        }
    }
    
    func onCheckoutDismissed() {
        print("\(#function): dismissing")
        self.onDismissCallback?([])
    }
    
    func checkoutFailed(with error: Error) {
        print("\(#function): \(error)")
        self.onPrimerErrorCallback?([error.localizedDescription])
    }
}
