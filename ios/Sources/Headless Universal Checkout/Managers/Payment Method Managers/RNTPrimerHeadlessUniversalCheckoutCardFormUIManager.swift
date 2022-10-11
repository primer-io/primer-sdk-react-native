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
    
    private lazy var cardFormUIManager: PrimerSDK.PrimerHeadlessUniversalCheckout.CardComponentsUIManager = {
        return PrimerSDK.PrimerHeadlessUniversalCheckout.CardComponentsUIManager()
    }()
    
    private var successCallback: RCTResponseSenderBlock? {
        didSet {
            
        }
    }
    
    deinit {
        print("🧨 deinit: \(self) \(Unmanaged.passUnretained(self).toOpaque())")
    }
        
    override init() {
        super.init()
        self.cardFormUIManager = PrimerSDK.PrimerHeadlessUniversalCheckout.CardComponentsUIManager()
        self.cardFormUIManager.delegate = self
    }
    
    @objc
    override func constantsToExport() -> [AnyHashable : Any]! {
        return ["message": "Hello from native code"]
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
                    if let inputElement = view as? PrimerHeadlessUniversalCheckoutInputElement {
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
                if let inputElement = view as? PrimerHeadlessUniversalCheckoutInputElement {
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

extension RNTPrimerHeadlessUniversalCheckoutCardFormUIManager: PrimerHeadlessUniversalCheckoutCardComponentsUIManagerDelegate {
    
    func cardFormUIManager(_ cardFormUIManager: PrimerSDK.PrimerHeadlessUniversalCheckout.CardComponentsUIManager, isCardFormValid: Bool) {
        
    }
}

extension RNTPrimerHeadlessUniversalCheckoutCardFormUIManager: PrimerInputElementDelegate {
    
    func inputElementDidFocus(_ sender: PrimerHeadlessUniversalCheckoutInputElement) {
        
    }
    
    func inputElementDidBlur(_ sender: PrimerHeadlessUniversalCheckoutInputElement) {
        
    }
    
}
