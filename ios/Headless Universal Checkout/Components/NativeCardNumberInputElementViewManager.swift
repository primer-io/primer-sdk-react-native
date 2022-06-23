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
        return primerCardNumberInputElement
    }
}

class RNTCardNumberInputElement: PrimerCardNumberInputElement {
    @objc var onFocus: RCTBubblingEventBlock!
    @objc var onBlur: RCTBubblingEventBlock!
    @objc var onValueChange: RCTBubblingEventBlock!
    @objc var onValueIsValid: RCTBubblingEventBlock!
    @objc var onValueTypeDetect: RCTBubblingEventBlock!
}
