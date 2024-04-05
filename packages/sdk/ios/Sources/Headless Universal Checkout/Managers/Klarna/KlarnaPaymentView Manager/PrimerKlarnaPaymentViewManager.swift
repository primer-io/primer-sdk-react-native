//
//  PrimerKlarnaPaymentViewManager.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 05.04.2024.
//

import Foundation
import UIKit

@objc(RNTPrimerKlarnaPaymentViewManager)
class RNTPrimerKlarnaPaymentViewManager: RCTViewManager {
    
    var primerKlarnaPaymentView: PrimerKlarnaPaymentView?
    
    override class func moduleName() -> String! {
        return "PrimerKlarnaPaymentView"
    }
    
    override func view() -> UIView! {
        return primerKlarnaPaymentView == nil ? PrimerKlarnaPaymentView() : primerKlarnaPaymentView
    }
    
    @objc func updatePrimerKlarnaPaymentView(view: PrimerKlarnaPaymentView) {
        primerKlarnaPaymentView = view
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}

