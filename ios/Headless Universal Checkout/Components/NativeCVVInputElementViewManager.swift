//
//  NativeCVVInputElementViewManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 20/6/22.
//

import PrimerSDK
import UIKit

@objc (NativeCVVInputElementViewManager)
class NativeCVVInputElementViewManager: RCTViewManager {
    
    var primerCVVInputElement: RNTCVVInputElement!
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        primerCVVInputElement = RNTCVVInputElement(type: .cvv, frame: .zero)
        primerCVVInputElement.inputElementDelegate = self
        return primerCVVInputElement
    }
}

extension NativeCVVInputElementViewManager: PrimerInputElementDelegate {
    
    func inputElementDidFocus(_ sender: PrimerInputElement) {
            primerCVVInputElement?.onFocus?(nil)
    }
    
    func inputElementDidBlur(_ sender: PrimerInputElement) {
        primerCVVInputElement?.onBlur?(nil)
    }
    
    func inputElementValueDidChange(_ sender: PrimerInputElement) {
        primerCVVInputElement?.onValueChange?(nil)
    }
    
    func inputElementValueIsValid(_ sender: PrimerInputElement, isValid: Bool) {
        primerCVVInputElement?.onValueIsValid?(["isValid": isValid])
    }
    
    func inputElementDidDetectType(_ sender: PrimerInputElement, type: Any?) {
        if let cardNetworkType = type as? CardNetwork {
            primerCVVInputElement?.onValueTypeDetect?(["type": cardNetworkType.rawValue])
        } else if let typeStr = type as? String {
            primerCVVInputElement?.onValueTypeDetect?(["type": typeStr])
        }
    }
}

class RNTCVVInputElement: PrimerCVVInputElement {
    @objc var onFocus: RCTBubblingEventBlock!
    @objc var onBlur: RCTBubblingEventBlock!
    @objc var onValueChange: RCTBubblingEventBlock!
    @objc var onValueIsValid: RCTBubblingEventBlock!
    @objc var onValueTypeDetect: RCTBubblingEventBlock!
}
