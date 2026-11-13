//
//  RNTPrimerApplePayButtonManager.swift
//  primer-io-react-native
//
//  Vends RNTPrimerApplePayButtonView, registered for JS as PrimerApplePayButton in the .m file.
//

import React
import UIKit

@objc(RNTPrimerApplePayButtonManager)
final class RNTPrimerApplePayButtonManager: RCTViewManager {

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return RNTPrimerApplePayButtonView()
  }
}
