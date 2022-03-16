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
    case onError
    
    var stringValue: String {
        switch self {
        case .onClientTokenCallback:
            return "onClientTokenCallback"
        case .onError:
            return "onError"
        }
    }
}

@objc(PrimerNative)
class RNTPrimer: RCTEventEmitter {
    
    private var clientTokenCallback: ((String?, Error?) -> Void)?
    private var resumeTokenCallback: ((String?, Error?) -> Void)?
    
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
    public func configureWithSettings(_ settingsStr: String) {
        do {
            try self.configure(settingsStr: settingsStr)
        } catch {
            self.checkoutFailed(with: error)
        }
    }
    
    @objc
    public func configureWithTheme(_ themeStr: String) {
        do {
            try self.configure(themeStr: themeStr)
        } catch {
            self.checkoutFailed(with: error)
        }
    }
    
    @objc
    public func configureWithSettings(_ settingsStr: String, themeStr: String) {
        do {
            try self.configure(settingsStr: settingsStr, themeStr: themeStr)
        } catch {
            self.checkoutFailed(with: error)
        }
    }
    
    @objc
    public func showUniversalCheckout() {
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.showUniversalCheckout(on: UIViewController(), clientToken: nil)
        }
    }
    
    @objc
    public func showUniversalCheckoutWithClientToken(_ clientToken: String) {
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.showUniversalCheckout(on: UIViewController(), clientToken: clientToken)
        }
    }
    
    @objc
    public func setClientToken(_ clientToken: String) {
        self.clientTokenCallback?(clientToken, nil)
    }
    
    @objc
    public func setResumeToken(_ resumeToken: String) {
        self.resumeTokenCallback?(resumeToken, nil)
    }
    
    @objc
    public func setError(_ errorStr: String) {
        
    }
    
    // MARK: - HELPERS
    
    private func configure(settingsStr: String? = nil, themeStr: String? = nil) throws {
        var settings: PrimerSettings?
        if let settingsStr = settingsStr {
            guard let settingsData = settingsStr.data(using: .utf8) else {
                return
            }
            let settingsRN = try JSONDecoder().decode(PrimerSettingsRN.self, from: settingsData)
            settings = settingsRN.asPrimerSettings()
        }
        
        var theme: PrimerTheme?
        if let themeStr = themeStr {
            guard let themeData = themeStr.data(using: .utf8) else {
                return
            }
            let themeRN = try JSONDecoder().decode(PrimerThemeRN.self, from: themeData)
            theme = themeRN.asPrimerTheme()
        }
        
        
        DispatchQueue.main.async {
            PrimerSDK.Primer.shared.configure(settings: settings, theme: theme)
        }
    }
    
    private func callActiveCallbackWithError(_ error: Error) {
        self.clientTokenCallback?(nil, error)
        self.resumeTokenCallback?(nil, error)
    }
    
    private func removeCallbacks() {
        self.clientTokenCallback = nil
        self.resumeTokenCallback = nil
    }
}

extension RNTPrimer: PrimerDelegate {
    
    func clientTokenCallback(_ completion: @escaping (String?, Error?) -> Void) {
        self.clientTokenCallback = { (clientToken, err) in
            completion(clientToken, err)
            self.removeCallbacks()
        }
        sendEvent(withName: PrimerEvents.onClientTokenCallback.stringValue, body: nil)
    }
    
    func checkoutFailed(with error: Error) {
        sendEvent(withName: PrimerEvents.onError.stringValue, body: nil)
    }
    
}
