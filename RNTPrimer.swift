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
    case clientTokenCallback = 0
    
    var stringValue: String {
        switch self {
        case .clientTokenCallback:
            return "clientTokenCallback"
        }
    }
}

@objc(Primer)
class RNTPrimer: RCTEventEmitter {
    
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
    public func showUniversalCheckout() {
        
    }
    
    @objc
    public func showUniversalCheckoutWithClientToken(_ clientToken: String) {
        
    }
    
}

extension RNTPrimer: PrimerDelegate {
    
    func clientTokenCallback(_ completion: @escaping (String?, Error?) -> Void) {
        
    }
    
}
