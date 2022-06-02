//
//  RNTPrimerHeadlessUniversalCheckoutCardFormUIManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 4/3/22.
//

import Foundation
import PrimerSDK

@objc(PrimerHeadlessUniversalCheckoutCardFormUIManager)
class RNTPrimerHeadlessUniversalCheckoutCardFormUIManager: RCTViewManager {
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    private lazy var cardFormUIManager: PrimerHeadlessUniversalCheckout.CardFormUIManager = {
        return try! PrimerHeadlessUniversalCheckout.CardFormUIManager()
    }()
    private var successCallback: RCTResponseSenderBlock?
    
    deinit {
        print("🧨 deinit: \(self) \(Unmanaged.passUnretained(self).toOpaque())")
    }
        
    override init() {
        super.init()
        do {
            self.cardFormUIManager = try PrimerHeadlessUniversalCheckout.CardFormUIManager()
            self.cardFormUIManager.cardFormUIManagerDelegate = self
        } catch {
            
        }
        
        print("⭐ init: \(self) \(Unmanaged.passUnretained(self).toOpaque())")
    }
    
    @objc
    override func constantsToExport() -> [AnyHashable : Any]! {
        return ["message": "Hello from native code"]
    }
    
    func cardFormUIManager(_ cardFormUIManager: PrimerHeadlessUniversalCheckout.CardFormUIManager, isCardFormValid: Bool) {
        
    }
        
    @objc
    func setInputElements(_ inputElements: String, errorCallback: RCTResponseSenderBlock, successCallback: @escaping RCTResponseSenderBlock) {
        print("RNTPrimerHeadlessUniversalCheckoutCardFormUIManager.setInputElements\n\(inputElements)")
        print("⭐ \(self) \(Unmanaged.passUnretained(self).toOpaque())")
        self.successCallback = successCallback
        self.successCallback?(["what??"])
    }
    
    @objc
    func setInputElementsWithTags(_ tags: [NSNumber]) {
        RCTUnsafeExecuteOnMainQueueSync {
            guard let rctUIManager = self.bridge.module(for: RCTUIManager.self) as? RCTUIManager else {
                return
            }

            for tag in tags {
                if let view = rctUIManager.view(forReactTag: tag) {
                    if let inputElement = view as? PrimerInputElement {
                        self.cardFormUIManager.inputElements = [inputElement]
                    }
                }
            }
        }
    }
    
    @objc
    func addInput(_ tag: NSNumber) {
        RCTUnsafeExecuteOnMainQueueSync {
            guard let rctUIManager = self.bridge.module(for: RCTUIManager.self) as? RCTUIManager else {
                return
            }
            
            if let view = rctUIManager.view(forReactTag: tag) {
                if let inputElement = view as? PrimerInputElement {
                    self.cardFormUIManager.inputElements = [inputElement]
                }
            }
            
        }
    }
    
    @objc
    func tokenize() {
        print("RNTPrimerHeadlessUniversalCheckoutCardFormUIManager.tokenize")
    }
    
}

extension RNTPrimerHeadlessUniversalCheckoutCardFormUIManager: PrimerInputElementDelegate {
    
    func inputElementDidFocus(_ sender: PrimerInputElement) {
        
    }
    
    func inputElementDidBlur(_ sender: PrimerInputElement) {
        
    }
    
}

extension RNTPrimerHeadlessUniversalCheckoutCardFormUIManager: PrimerCardFormDelegate {
    
    
    
}
