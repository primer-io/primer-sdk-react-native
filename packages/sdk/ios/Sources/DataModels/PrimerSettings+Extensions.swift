import PrimerSDK

extension PrimerSettings {

  // swiftlint:disable function_body_length
  // swiftlint:disable cyclomatic_complexity
  convenience init(settingsStr: String?) throws {
    if settingsStr == nil {
      self.init()
    } else {
      guard let settingsData = settingsStr!.data(using: .utf8) else {
        let err = RNTNativeError(
          errorId: "native-ios",
          errorDescription: "The value of the 'settings' object is invalid.",
          recoverySuggestion: "Provide a valid 'settings' object"
        )
        throw err
      }

      let settingsJson = try JSONSerialization.jsonObject(with: settingsData)

      guard let settingsJson = settingsJson as? [String: Any] else {
        let err = RNTNativeError(
          errorId: "native-ios",
          errorDescription: "The 'settings' object is not a valid JSON",
          recoverySuggestion: "Provide a valid 'settings' object"
        )
        throw err
      }

      var paymentHandling: PrimerPaymentHandling = .auto
      if let rnPaymentHandling = settingsJson["paymentHandling"] as? String,
        rnPaymentHandling == "MANUAL" {
        paymentHandling = .manual
      }

      let rnLocaleDataLanguageCode =
        (settingsJson["localeData"] as? [String: Any])?["languageCode"] as? String
      let rnLocaleDataLocaleCode =
        (settingsJson["localeData"] as? [String: Any])?["localeCode"] as? String
      let localeData = PrimerLocaleData(
        languageCode: rnLocaleDataLanguageCode,
        regionCode: rnLocaleDataLocaleCode)

      let rnUrlScheme =
        ((settingsJson["paymentMethodOptions"] as? [String: Any])?["iOS"] as? [String: Any])?[
          "urlScheme"] as? String

      var applePayOptions: PrimerApplePayOptions?
      if let rnApplePayOptions =
        ((settingsJson["paymentMethodOptions"] as? [String: Any])?["applePayOptions"]
          as? [String: Any]),
        let rnApplePayMerchantIdentifier = rnApplePayOptions["merchantIdentifier"] as? String {
        let rnApplePayMerchantName = rnApplePayOptions["merchantName"] as? String
        let rnApplePayIsCaptureBillingAddressEnabled =
          (rnApplePayOptions["isCaptureBillingAddressEnabled"] as? Bool) ?? false
        // swiftlint:disable identifier_name
        let rnApplePayShowApplePayForUnsupportedDevice =
          (rnApplePayOptions["showApplePayForUnsupportedDevice"] as? Bool) ?? true
        // swiftlint:enable identifier_name
        let rnApplePayCheckProvidedNetworks =
          (rnApplePayOptions["checkProvidedNetworks"] as? Bool) ?? true

        var shippingOptions: PrimerApplePayOptions.ShippingOptions?
        if let rnShippingOptions = rnApplePayOptions["shippingOptions"] as? [String: Any] {
          let requireShippingMethod = rnShippingOptions["requireShippingMethod"] as? Bool ?? false

          var shippingContactFields: [PrimerApplePayOptions.RequiredContactField]?
          if let requiredFieldsStrings = rnShippingOptions["shippingContactFields"] as? [String] {
            shippingContactFields = requiredFieldsStrings.compactMap { fieldStr in
              switch fieldStr {
              case "name":
                return .name
              case "emailAddress":
                return .emailAddress
              case "phoneNumber":
                return .phoneNumber
              case "postalAddress":
                return .postalAddress
              default:
                return nil  // Ignore unknown values or handle accordingly
              }
            }
          }

          shippingOptions = PrimerApplePayOptions.ShippingOptions(
            shippingContactFields: shippingContactFields,
            requireShippingMethod: requireShippingMethod
          )
        }

        var billingOptions: PrimerApplePayOptions.BillingOptions?
        if let rnBillingOptions = rnApplePayOptions["billingOptions"] as? [String: Any] {
          var requiredBillingContactFields: [PrimerApplePayOptions.RequiredContactField]?
          if let requiredFieldsStrings = rnBillingOptions["requiredBillingContactFields"]
            as? [String] {
            requiredBillingContactFields = requiredFieldsStrings.compactMap { fieldStr in
              switch fieldStr {
              case "name":
                return .name
              case "emailAddress":
                return .emailAddress
              case "phoneNumber":
                return .phoneNumber
              case "postalAddress":
                return .postalAddress
              default:
                return nil  // Ignore unknown values or handle accordingly
              }
            }
          }

          billingOptions = PrimerApplePayOptions.BillingOptions(
            requiredBillingContactFields: requiredBillingContactFields
          )
        }

        applePayOptions = PrimerApplePayOptions(
          merchantIdentifier: rnApplePayMerchantIdentifier,
          merchantName: rnApplePayMerchantName,
          isCaptureBillingAddressEnabled: rnApplePayIsCaptureBillingAddressEnabled,
          showApplePayForUnsupportedDevice: rnApplePayShowApplePayForUnsupportedDevice,
          checkProvidedNetworks: rnApplePayCheckProvidedNetworks,
          shippingOptions: shippingOptions,
          billingOptions: billingOptions
        )
      }

      var klarnaOptions: PrimerKlarnaOptions?
      if let rnKlarnaRecurringPaymentDescription =
        ((settingsJson["paymentMethodOptions"]
        as? [String: Any])?["klarnaOptions"]
        as? [String: Any])?["recurringPaymentDescription"]
        as? String {
        klarnaOptions = PrimerKlarnaOptions(
          recurringPaymentDescription: rnKlarnaRecurringPaymentDescription)
      }

      var uiOptions: PrimerUIOptions?
      if let rnUIOptions = settingsJson["uiOptions"] as? [String: Any] {

        var theme: PrimerTheme?
        if let rnTheme = rnUIOptions["theme"] as? [String: Any] {
          let rnThemeData = (try JSONSerialization.data(withJSONObject: rnTheme))
          let rnTheme = try JSONDecoder().decode(PrimerThemeRN.self, from: rnThemeData)
          theme = rnTheme.asPrimerTheme()
        }
        
        var cardFormUIOptions: PrimerCardFormUIOptions?
        if let rnCardFormUIOptions = rnUIOptions["cardFormUIOptions"] as? [String: Any] {
            let rnCardFormUIOptionsData = try (JSONSerialization.data(withJSONObject: rnCardFormUIOptions))
            let rnCardFormUIOptions = try JSONDecoder().decode(PrimerCardFormUIOptionsRN.self, from: rnCardFormUIOptionsData)
            cardFormUIOptions = rnCardFormUIOptions.asPrimerCardFormUIOptions()
        }

        uiOptions = PrimerUIOptions(
          isInitScreenEnabled: rnUIOptions["isInitScreenEnabled"] as? Bool,
          isSuccessScreenEnabled: rnUIOptions["isSuccessScreenEnabled"] as? Bool,
          isErrorScreenEnabled: rnUIOptions["isErrorScreenEnabled"] as? Bool,
          dismissalMechanism: {
            if let mechanisms = rnUIOptions["dismissalMechanism"] as? [String] {
              var dismissalMechanisms: [DismissalMechanism] = []
              for mechanism in mechanisms {
                switch mechanism {
                case "gestures":
                  dismissalMechanisms.append(.gestures)
                case "closeButton":
                  dismissalMechanisms.append(.closeButton)
                default:
                  break
                }
              }
              return dismissalMechanisms.isEmpty ? nil : dismissalMechanisms
            }
            return nil
          }(),
          theme: theme,
          cardFormUIOptions: cardFormUIOptions
          )
      }

      var debugOptions: PrimerDebugOptions?
      if let rnIs3DSSanityCheckEnabled = (settingsJson["debugOptions"] as? [String: Any])?[
        "is3DSSanityCheckEnabled"] as? Bool {
        debugOptions = PrimerDebugOptions(is3DSSanityCheckEnabled: rnIs3DSSanityCheckEnabled)
      }

      var clientSessionCachingEnabled: Bool?
      if let clientSessionCachingEnabledValue =
        (settingsJson["clientSessionCachingEnabled"] as? Bool) {
        clientSessionCachingEnabled = clientSessionCachingEnabledValue
      }

      var apiVersion: PrimerApiVersion?
      if let apiVersionValue = (settingsJson["apiVersion"] as? String) {
        switch (apiVersionValue) {
        case "2.3":
          apiVersion = PrimerApiVersion.V2_3
          break
        case "2.4":
          apiVersion = PrimerApiVersion.V2_4
          break
        case "latest":
          apiVersion = PrimerApiVersion.latest
          break
        default:
          throw RNTNativeError(errorId: "native-ios", errorDescription: "The value of the 'apiVersion' string is invalid.", recoverySuggestion: "Provide a valid 'apiVersion' string")
        }
      }

      var threeDsOptions: PrimerThreeDsOptions?
      if let rnThreeDsAppRequestorUrlStr =
        (((settingsJson["paymentMethodOptions"]
        as? [String: Any])?["threeDsOptions"]
        as? [String: Any])?["iOS"]
        as? [String: Any])?["threeDsAppRequestorUrl"]
        as? String {
        threeDsOptions = PrimerThreeDsOptions(threeDsAppRequestorUrl: rnThreeDsAppRequestorUrlStr)
      }

      var stripeOptions: PrimerStripeOptions?
      if let stripeOptionsMap =
        ((settingsJson["paymentMethodOptions"] as? [String: Any])?["stripeOptions"]
          as? [String: Any]) {
        if let publishableKey = stripeOptionsMap["publishableKey"] as? String {
          var mandateData: PrimerStripeOptions.MandateData?
          if let mandateDataMap = stripeOptionsMap["mandateData"] as? [String: String] {
            if let fullMandateText = mandateDataMap["fullMandateText"] {
              mandateData = .fullMandate(text: fullMandateText)
            } else if let merchantName = mandateDataMap["merchantName"] {
              mandateData = .templateMandate(merchantName: merchantName)
            } else {
              PrimerLogging.shared.logger.warn(
                message:
                  "Found mandate data but no resource key or merchant name - check your stripe config"
              )
            }
          } else {
            PrimerLogging.shared.logger.warn(
              message: "Found stripe options but no mandate data - check your stripe config")
          }
          stripeOptions = .init(
            publishableKey: publishableKey,
            mandateData: mandateData
          )
        }
      }

      let paymentMethodOptions = PrimerPaymentMethodOptions(
        urlScheme: rnUrlScheme,
        applePayOptions: applePayOptions,
        klarnaOptions: klarnaOptions,
        threeDsOptions: threeDsOptions,
        stripeOptions: stripeOptions)

      self.init(
        paymentHandling: paymentHandling,
        localeData: localeData,
        paymentMethodOptions: paymentMethodOptions,
        uiOptions: uiOptions,
        debugOptions: debugOptions,
        clientSessionCachingEnabled: clientSessionCachingEnabled ?? false,
        apiVersion: apiVersion ?? .latest)
    }
  }
  // swiftlint:enable function_body_length
  // swiftlint:enable cyclomatic_complexity
}
