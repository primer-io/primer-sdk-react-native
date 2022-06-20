//
//  NativeCardNumberInputElementView.swift
//  primer-io-react-native
//
//  Created by Evangelos on 20/6/22.
//

import PrimerSDK
import UIKit

@objc (NativeCardNumberInputElementViewManager)
class NativeCardNumberInputElementViewManager: RCTViewManager {
    
    var primerCardNumberInputElement: RNTCardNumberInputElement!
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        primerCardNumberInputElement = RNTCardNumberInputElement(type: .cardNumber, frame: .zero)
        primerCardNumberInputElement.inputElementDelegate = self
        return primerCardNumberInputElement
    }
}

extension NativeCardNumberInputElementViewManager: PrimerInputElementDelegate {
    
    func inputElementDidFocus(_ sender: PrimerInputElement) {
        primerCardNumberInputElement?.onFocus?(nil)
    }
    
    func inputElementDidBlur(_ sender: PrimerInputElement) {
        primerCardNumberInputElement?.onBlur?(nil)
    }
    
    func inputElementValueDidChange(_ sender: PrimerInputElement) {
        primerCardNumberInputElement?.onValueChange?(nil)
    }
    
    func inputElementValueIsValid(_ sender: PrimerInputElement, isValid: Bool) {
        primerCardNumberInputElement?.onValueIsValid?(["isValid": isValid])
    }
    
    func inputElementDidDetectType(_ sender: PrimerInputElement, type: Any?) {
        if let cardNetworkType = type as? CardNetwork {
            primerCardNumberInputElement?.onValueTypeDetect?(["type": cardNetworkType.rawValue])
        } else if let typeStr = type as? String {
            primerCardNumberInputElement?.onValueTypeDetect?(["type": typeStr])
        }
    }
}

class RNTCardNumberInputElement: PrimerCardNumberInputElement {
    @objc var onFocus: RCTBubblingEventBlock!
    @objc var onBlur: RCTBubblingEventBlock!
    @objc var onValueChange: RCTBubblingEventBlock!
    @objc var onValueIsValid: RCTBubblingEventBlock!
    @objc var onValueTypeDetect: RCTBubblingEventBlock!
}
