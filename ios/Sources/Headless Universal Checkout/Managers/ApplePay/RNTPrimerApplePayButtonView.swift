//
//  RNTPrimerApplePayButtonView.swift
//  primer-io-react-native
//
//  PassKit's own Apple Pay button for the Checkout Components payment method list. Display-only:
//  the JS row owns the tap and wraps this view in pointerEvents="none", as with the Google Pay button.
//

import PassKit
import UIKit

@objc(RNTPrimerApplePayButtonView)
final class RNTPrimerApplePayButtonView: UIView {

  /// "light" or "dark": the scheme the list renders in, so a forced appearanceMode wins over the phone.
  @objc var colorScheme: String = "light" {
    didSet { button.overrideUserInterfaceStyle = Self.userInterfaceStyle(for: colorScheme) }
  }

  @objc var cornerRadius: CGFloat = 8 {
    didSet { button.cornerRadius = cornerRadius }
  }

  private let button: PKPaymentButton = {
    // .automatic draws black on light and white on dark, following the overridden trait. The pod
    // targets iOS 13, which has no .automatic; React Native itself needs iOS 15.1.
    let style: PKPaymentButtonStyle
    if #available(iOS 14.0, *) {
      style = .automatic
    } else {
      style = .black
    }
    let paymentButton = PKPaymentButton(paymentButtonType: .plain, paymentButtonStyle: style)
    paymentButton.isUserInteractionEnabled = false
    return paymentButton
  }()

  override init(frame: CGRect) {
    super.init(frame: frame)
    button.overrideUserInterfaceStyle = Self.userInterfaceStyle(for: colorScheme)
    button.cornerRadius = cornerRadius
    addSubview(button)
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    nil
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    button.frame = bounds
  }

  private static func userInterfaceStyle(for colorScheme: String) -> UIUserInterfaceStyle {
    colorScheme == "dark" ? .dark : .light
  }
}
