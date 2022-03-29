//
//  Primer.swift
//  primer-io-react-native
//
//  Created by Evangelos on 15/3/22.
//

import Foundation
import PrimerSDK

@objc
enum PrimerEvents: Int, CaseIterable {
    case onClientTokenCallback = 0
    case onClientSessionActions
    case onTokenizeSuccessCallback
    case onResumeSuccess
    case onCheckoutDismissed
    case onError
    
    case detectImplementedRNCallbacks
    
    var stringValue: String {
        switch self {
        case .onClientTokenCallback:
            return "onClientTokenCallback"
        case .onClientSessionActions:
            return "onClientSessionActions"
        case .onTokenizeSuccessCallback:
            return "onTokenizeSuccessCallback"
        case .onResumeSuccess:
            return "onResumeSuccess"
        case .onCheckoutDismissed:
            return "onCheckoutDismissed"
        case .onError:
            return "onError"
        case .detectImplementedRNCallbacks:
            return "detectImplementedRNCallbacks"
        }
    }
}

@objc(NativePrimer)
class RNTPrimer: RCTEventEmitter {
    
    private var isClientTokenCallbackImplementedInRN: Bool?
    private var clientTokenCallback: ((String?, Error?) -> Void)?
    private var isOnClientSessionActionsImplementedInRN: Bool?
    private var onClientSessionActions: ((String?, Error?) -> Void)?
    private var onTokenizeSuccess: ((String?, Error?) -> Void)?
    private var onResumeSuccess: ((String?, Error?) -> Void)?
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
    public func configureWithSettings(_ settingsStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                try self.configure(settingsStr: settingsStr)
                resolver(nil)
            } catch {
                self.checkoutFailed(with: error)
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    @objc
    public func configureWithTheme(_ themeStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                try self.configure(themeStr: themeStr)
                resolver(nil)
            } catch {
                self.checkoutFailed(with: error)
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    @objc
    public func showUniversalCheckout(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.showUniversalCheckout(on: UIViewController(), clientToken: nil)
            resolver(nil)
        }
    }
    
    @objc
    public func showUniversalCheckoutWithClientToken(_ clientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.showUniversalCheckout(on: UIViewController(), clientToken: clientToken)
            resolver(nil)
        }
    }
    
    @objc
    public func showVaultManager(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.showVaultManager(on: UIViewController(), clientToken: nil)
            resolver(nil)
        }
    }
    
    @objc
    public func showVaultManager(_ clientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.showVaultManager(on: UIViewController(), clientToken: clientToken)
            resolver(nil)
        }
    }
    
    @objc
    public func handleNewClientToken(_ clientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.callCallbackWithClientToken(clientToken)
            resolver(nil)
        }
    }
    
    @objc
    public func handleError(_ errorStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                guard let errorData = errorStr.data(using: .utf8) else {
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
                    throw err
                }
                
                let err = try JSONDecoder().decode(NativeError.self, from: errorData)
                self.callCallbackWithError(err)
                resolver(nil)
            } catch {
                self.checkoutFailed(with: error)
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    @objc
    public func handleSuccess(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.callCallbackToContinueFlow()
            resolver(nil)
        }
    }
    
    @objc
    public func setImplementedRNCallbacks(_ implementedRNCallbacksStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                guard let implementedRNCallbacksData = implementedRNCallbacksStr.data(using: .utf8) else {
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
                    throw err
                }
                self.implementedReactNativeCallbacks = try JSONDecoder().decode(ImplementedReactNativeCallbacks.self, from: implementedRNCallbacksData)
                print("implementedRNCallbacksStr: \(implementedRNCallbacksStr)\nself.implementedReactNativeCallbacks: \(self.implementedReactNativeCallbacks)")
                Primer.shared.setImplementedReactNativeCallbacks(self.implementedReactNativeCallbacks!)
                resolver(nil)
            } catch {
                self.checkoutFailed(with: error)
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    // MARK: - HELPERS
    
    private func configure(settingsStr: String? = nil, themeStr: String? = nil) throws {
        var settings: PrimerSettings?
        if let settingsStr = settingsStr {
            guard let settingsData = settingsStr.data(using: .utf8) else {
                let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
                throw err
            }
            let settingsRN = try JSONDecoder().decode(PrimerSettingsRN.self, from: settingsData)
            settings = settingsRN.asPrimerSettings()
        }
        
        var theme: PrimerTheme?
        if let themeStr = themeStr {
            guard let themeData = themeStr.data(using: .utf8) else {
                let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
                throw err
            }
            let themeRN = try JSONDecoder().decode(PrimerThemeRN.self, from: themeData)
            theme = themeRN.asPrimerTheme()
        }
    
        PrimerSDK.Primer.shared.configure(settings: settings, theme: theme)
    }
    
    private func detectImplemetedCallbacks() {
        sendEvent(withName: PrimerEvents.detectImplementedRNCallbacks.stringValue, body: nil)
    }
    
    private func callCallbackWithClientToken(_ clientToken: String) {
        self.clientTokenCallback?(clientToken, nil)
        self.onClientSessionActions?(clientToken, nil)
        self.onTokenizeSuccess?(clientToken, nil)
        self.onResumeSuccess?(clientToken, nil)
        self.removeCallbacksAndHandlers()
    }
    
    private func callCallbackWithError(_ err: Error) {
        self.clientTokenCallback?(nil, err)
        self.onClientSessionActions?(nil, err)
        self.onTokenizeSuccess?(nil, err)
        self.onResumeSuccess?(nil, err)
        self.removeCallbacksAndHandlers()
    }
    
    private func callCallbackToContinueFlow() {
        self.clientTokenCallback?(nil, nil)
        self.onClientSessionActions?(nil, nil)
        self.onTokenizeSuccess?(nil, nil)
        self.onResumeSuccess?(nil, nil)
        self.removeCallbacksAndHandlers()
    }
    
    private func removeCallbacksAndHandlers() {
        self.clientTokenCallback = nil
        self.onClientSessionActions = nil
        self.onTokenizeSuccess = nil
        self.onResumeSuccess = nil
    }

}

extension RNTPrimer: PrimerDelegate {
    
    func clientTokenCallback(_ completion: @escaping (String?, Error?) -> Void) {
        DispatchQueue.main.async {
            if self.implementedReactNativeCallbacks?.isClientTokenCallbackImplemented == true {
                self.clientTokenCallback = { (clientToken, err) in
                    completion(clientToken, err)
                    self.removeCallbacksAndHandlers()
                }
                self.sendEvent(withName: PrimerEvents.onClientTokenCallback.stringValue, body: nil)
            } else {
                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [clientTokenCallback] should had been implemented."])
                completion(nil, err)
            }
        }
    }
    
    func onClientSessionActions(_ actions: [ClientSession.Action], resumeHandler: ResumeHandlerProtocol?) {
        DispatchQueue.main.async {
            if self.implementedReactNativeCallbacks?.isClientSessionActionsImplemented == true {
                self.onClientSessionActions = { (newClientToken, err) in
                    if let err = err {
                        resumeHandler?.handle(error: err)
                    } else if let newClientToken = newClientToken {
                        resumeHandler?.handle(newClientToken: newClientToken)
                    } else {
                        resumeHandler?.handleSuccess()
                    }
                }
                
                do {
                    let actionsData = try JSONEncoder().encode(actions)
                    let actionsJson = try JSONSerialization.jsonObject(with: actionsData, options: .allowFragments)
                    self.sendEvent(withName: PrimerEvents.onClientSessionActions.stringValue, body: actionsJson)
                } catch {
                    self.checkoutFailed(with: error)
                }
            } else {
                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onClientSessionActions] should had been implemented."])
                resumeHandler?.handle(error: err)
            }
            
        }
    }
    
    func onTokenizeSuccess(_ paymentMethodToken: PaymentMethodToken, resumeHandler: ResumeHandlerProtocol) {
        DispatchQueue.main.async {
            self.onTokenizeSuccess = { (newClientToken, err) in
                if let err = err {
                    resumeHandler.handle(error: err)
                } else if let newClientToken = newClientToken {
                    resumeHandler.handle(newClientToken: newClientToken)
                } else {
                    resumeHandler.handleSuccess()
                }
            }
            
            do {
                let paymentMethodTokenData = try JSONEncoder().encode(paymentMethodToken)
                let paymentMethodTokenJson = try JSONSerialization.jsonObject(with: paymentMethodTokenData, options: .allowFragments)
                self.sendEvent(withName: PrimerEvents.onTokenizeSuccessCallback.stringValue, body: paymentMethodTokenJson)
            } catch {
                self.checkoutFailed(with: error)
            }
        }
    }
    
    func onResumeSuccess(_ clientToken: String, resumeHandler: ResumeHandlerProtocol) {
        DispatchQueue.main.async {
            if self.implementedReactNativeCallbacks?.isOnResumeSuccessImplemented == true {
                self.onResumeSuccess = { (newClientToken, err) in
                    if let err = err {
                        resumeHandler.handle(error: err)
                    } else if let newClientToken = newClientToken {
                        resumeHandler.handle(newClientToken: newClientToken)
                    } else {
                        resumeHandler.handleSuccess()
                    }
                }
                
                self.sendEvent(withName: PrimerEvents.onResumeSuccess.stringValue, body: ["resumeToken": clientToken])
            } else {
                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onResumeSuccess] should had been implemented."])
                resumeHandler.handle(error: err)
            }
        }
    }
    
    func onResumeError(_ error: Error) {
        DispatchQueue.main.async {
            if self.implementedReactNativeCallbacks?.isOnResumeErrorImplemented == true {
                self.checkoutFailed(with: error)
            } else {
                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onResumeError] should had been implemented."])
                self.checkoutFailed(with: err)
            }
        }
    }
    
    func onCheckoutDismissed() {
        DispatchQueue.main.async {
            if self.implementedReactNativeCallbacks?.isOnCheckoutDismissedImplemented == true {
                self.sendEvent(withName: PrimerEvents.onCheckoutDismissed.stringValue, body: nil)
            } else {
                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onCheckoutDismissed] should had been implemented."])
                self.checkoutFailed(with: err)
            }
        }
    }
    
    func checkoutFailed(with error: Error) {
        DispatchQueue.main.async {
            self.sendEvent(withName: PrimerEvents.onError.stringValue, body: ["error": error.rnError])
        }
    }
    
}
