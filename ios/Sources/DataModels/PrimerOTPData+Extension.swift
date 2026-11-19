//
//  PrimerOTPData+Extension.swift
//  primer-io-react-native
//
//  Decodes the JS raw-data payload `{ "otp": "..." }` into the native PrimerSDK PrimerOTPData
//  (BLIK). Mirrors PrimerPhoneNumberData+Extension.
//

import Foundation
import PrimerSDK

extension PrimerOTPData {

  convenience init?(otpDataStr: String) {
    do {
      guard let data = otpDataStr.data(using: .utf8) else {
        return nil
      }

      let json = try JSONSerialization.jsonObject(with: data)

      guard let dict = json as? [String: String] else {
        return nil
      }

      if let otp = dict["otp"] {
        self.init(otp: otp)
      } else {
        return nil
      }

    } catch {
      return nil
    }
  }
}
