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
        primerCardNumberInputElement?.onCardNumberInputElementFocus?(nil)
    }
}

class RNTCardNumberInputElement: PrimerCardNumberInputElement {
    @objc var onCardNumberInputElementFocus: RCTBubblingEventBlock!
}
