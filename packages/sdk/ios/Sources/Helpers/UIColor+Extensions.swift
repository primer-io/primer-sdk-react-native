//
//  UIColor+Extensions.swift
//  primer-io-react-native
//
//  Created by Evangelos on 6/10/22.
//

import UIKit

extension UIColor {

  func toHex(alpha: Bool = false) -> String? {
    guard let components = cgColor.components, components.count >= 3 else {
      return nil
    }

    let red = Float(components[0])
    let green = Float(components[1])
    let blue = Float(components[2])
    var alphaValue = Float(1.0)

    if components.count >= 4 {
      alphaValue = Float(components[3])
    }

    if alpha {
      return String(
        format: "%02lX%02lX%02lX%02lX", lroundf(red * 255), lroundf(green * 255),
        lroundf(blue * 255), lroundf(alphaValue * 255))
    } else {
      return String(
        format: "%02lX%02lX%02lX", lroundf(red * 255), lroundf(green * 255), lroundf(blue * 255))
    }
  }
}
