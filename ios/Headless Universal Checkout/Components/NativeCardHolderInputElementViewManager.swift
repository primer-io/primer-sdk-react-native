//
//  NativeCardHolderInputElementViewManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 21/6/22.
//

import PrimerSDK
import UIKit

@objc (NativeCardHolderInputElementViewManager)
class NativeCardHolderInputElementViewManager: RCTViewManager {
    
    var primerCardHolderInputElement: RNTCardHolderInputElement!
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        primerCardHolderInputElement = RNTCardHolderInputElement(type: .cardholderName, frame: .zero)
        primerCardHolderInputElement.inputElementDelegate = self
        return primerCardHolderInputElement
    }
}

extension NativeCardHolderInputElementViewManager: PrimerInputElementDelegate {
    
    func inputElementDidFocus(_ sender: PrimerInputElement) {
        primerCardHolderInputElement?.onFocus?(nil)
    }
    
    func inputElementDidBlur(_ sender: PrimerInputElement) {
        primerCardHolderInputElement?.onBlur?(nil)
    }
    
    func inputElementValueDidChange(_ sender: PrimerInputElement) {
        primerCardHolderInputElement?.onValueChange?(nil)
    }
    
    func primerCardHolderInputElement(_ sender: PrimerInputElement, isValid: Bool) {
        primerCardHolderInputElement?.onValueIsValid?(["isValid": isValid])
    }
}

class RNTCardHolderInputElement: PrimerCardholderNameInputElement {
    @objc var onFocus: RCTBubblingEventBlock!
    @objc var onBlur: RCTBubblingEventBlock!
    @objc var onValueChange: RCTBubblingEventBlock!
    @objc var onValueIsValid: RCTBubblingEventBlock!
    @objc var onValueTypeDetect: RCTBubblingEventBlock!
}
