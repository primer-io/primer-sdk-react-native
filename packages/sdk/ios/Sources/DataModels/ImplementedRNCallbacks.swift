//
//  ImplementedRNCallbacks.swift
//  primer-io-react-native
//
//  Created by Evangelos on 20/5/22.
//

import Foundation

internal struct ImplementedRNCallbacks: Decodable {

  // swiftlint:disable identifier_name
  internal var isOnAvailablePaymentMethodsLoadImplemented = false
  // swiftlint:enable identifier_name

  internal var isOnTokenizationStartImplemented = false
  internal var isOnTokenizationSuccessImplemented = false

  internal var isOnCheckoutResumeImplemented = false
  internal var isOnCheckoutPendingImplemented = false
  internal var isOnCheckoutAdditionalInfoImplemented = false

  internal var isOnErrorImplemented = false
  internal var isOnCheckoutCompleteImplemented = false
  internal var isOnBeforeClientSessionUpdateImplemented = false

  internal var isOnClientSessionUpdateImplemented = false
  internal var isOnBeforePaymentCreateImplemented = false
  internal var isOnPreparationStartImplemented = false

  internal var isOnPaymentMethodShowImplemented = false
  internal var isOnDismissImplemented = false

  enum CodingKeys: String, CodingKey {
    // swiftlint:disable identifier_name
    case isOnAvailablePaymentMethodsLoadImplemented = "onAvailablePaymentMethodsLoad"
    // swiftlint:enable identifier_name

    case isOnTokenizationStartImplemented = "onTokenizationStart"
    case isOnTokenizationSuccessImplemented = "onTokenizationSuccess"

    case isOnCheckoutResumeImplemented = "onCheckoutResume"
    case isOnCheckoutPendingImplemented = "onCheckoutPending"
    case isOnCheckoutAdditionalInfoImplemented = "onCheckoutAdditionalInfo"

    case isOnErrorImplemented = "onError"
    case isOnCheckoutCompleteImplemented = "onCheckoutComplete"
    case isOnBeforeClientSessionUpdateImplemented = "onBeforeClientSessionUpdate"

    case isOnClientSessionUpdateImplemented = "onClientSessionUpdate"
    case isOnBeforePaymentCreateImplemented = "onBeforePaymentCreate"
    case isOnPreparationStartImplemented = "onPreparationStart"

    case isOnPaymentMethodShowImplemented = "onPaymentMethodShow"
    case isOnDismissImplemented = "onDismiss"
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)

    self.isOnAvailablePaymentMethodsLoadImplemented =
      (try? container.decode(Bool.self, forKey: .isOnAvailablePaymentMethodsLoadImplemented))
      ?? false
    self.isOnTokenizationStartImplemented =
      (try? container.decode(Bool.self, forKey: .isOnTokenizationStartImplemented)) ?? false
    self.isOnTokenizationSuccessImplemented =
      (try? container.decode(Bool.self, forKey: .isOnTokenizationSuccessImplemented)) ?? false

    self.isOnCheckoutResumeImplemented =
      (try? container.decode(Bool.self, forKey: .isOnCheckoutResumeImplemented)) ?? false
    self.isOnCheckoutPendingImplemented =
      (try? container.decode(Bool.self, forKey: .isOnCheckoutPendingImplemented)) ?? false
    self.isOnCheckoutAdditionalInfoImplemented =
      (try? container.decode(Bool.self, forKey: .isOnCheckoutAdditionalInfoImplemented)) ?? false

    self.isOnErrorImplemented =
      (try? container.decode(Bool.self, forKey: .isOnErrorImplemented)) ?? false
    self.isOnCheckoutCompleteImplemented =
      (try? container.decode(Bool.self, forKey: .isOnCheckoutCompleteImplemented)) ?? false
    self.isOnBeforeClientSessionUpdateImplemented =
      (try? container.decode(Bool.self, forKey: .isOnBeforeClientSessionUpdateImplemented)) ?? false

    self.isOnClientSessionUpdateImplemented =
      (try? container.decode(Bool.self, forKey: .isOnClientSessionUpdateImplemented)) ?? false
    self.isOnBeforePaymentCreateImplemented =
      (try? container.decode(Bool.self, forKey: .isOnBeforePaymentCreateImplemented)) ?? false
    self.isOnPreparationStartImplemented =
      (try? container.decode(Bool.self, forKey: .isOnPreparationStartImplemented)) ?? false

    self.isOnPaymentMethodShowImplemented =
      (try? container.decode(Bool.self, forKey: .isOnPaymentMethodShowImplemented)) ?? false
    self.isOnDismissImplemented =
      (try? container.decode(Bool.self, forKey: .isOnDismissImplemented)) ?? false
  }
}
