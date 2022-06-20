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
    
    var primerCardNumberInputElement: PrimerCardNumberInputElement!
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        primerCardNumberInputElement = PrimerCardNumberInputElement(type: .cardNumber, frame: .zero)
        return primerCardNumberInputElement
    }
}
