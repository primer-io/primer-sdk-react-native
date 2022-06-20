//
//  NativeExpiryDateInputElementViewManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 20/6/22.
//

import PrimerSDK
import UIKit

@objc (NativeExpiryDateInputElementViewManager)
class NativeExpiryDateInputElementViewManager: RCTViewManager {
    
    var primerExpiryDateInputElement: RNTExpiryDateInputElement!
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        primerExpiryDateInputElement = RNTExpiryDateInputElement(type: .expiryDate, frame: .zero)
        primerExpiryDateInputElement.inputElementDelegate = self
        return primerExpiryDateInputElement
    }
}

extension NativeExpiryDateInputElementViewManager: PrimerInputElementDelegate {
    
    func inputElementDidFocus(_ sender: PrimerInputElement) {
        primerExpiryDateInputElement?.onFocus?(nil)
    }
    
    func inputElementDidBlur(_ sender: PrimerInputElement) {
        primerExpiryDateInputElement?.onBlur?(nil)
    }
    
    func inputElementValueDidChange(_ sender: PrimerInputElement) {
        primerExpiryDateInputElement?.onValueChange?(nil)
    }
    
    func inputElementValueIsValid(_ sender: PrimerInputElement, isValid: Bool) {
        primerExpiryDateInputElement?.onValueIsValid?(["isValid": isValid])
    }
    
    func inputElementDidDetectType(_ sender: PrimerInputElement, type: Any?) {
        if let cardNetworkType = type as? CardNetwork {
            primerExpiryDateInputElement?.onValueTypeDetect?(["type": cardNetworkType.rawValue])
        } else if let typeStr = type as? String {
            primerExpiryDateInputElement?.onValueTypeDetect?(["type": typeStr])
        }
    }
}

class RNTExpiryDateInputElement: PrimerExpiryDateInputElement {
    @objc var onFocus: RCTBubblingEventBlock!
    @objc var onBlur: RCTBubblingEventBlock!
    @objc var onValueChange: RCTBubblingEventBlock!
    @objc var onValueIsValid: RCTBubblingEventBlock!
    @objc var onValueTypeDetect: RCTBubblingEventBlock!
}
