import PrimerSDK

extension PrimerSettings {

    convenience init(settingsStr: String?) throws {
        if settingsStr == nil {
            self.init()
        } else {
            guard let settingsData = settingsStr!.data(using: .utf8) else {
                let err = RNTNativeError(errorId: "native-ios", errorDescription: "The value of the 'settings' object is invalid.", recoverySuggestion: "Provide a valid 'settings' object")
                throw err
            }

            let settingsJson = try JSONSerialization.jsonObject(with: settingsData)

            guard let settingsJson = settingsJson as? [String: Any] else {
                let err = RNTNativeError(errorId: "native-ios", errorDescription: "The 'settings' object is not a valid JSON", recoverySuggestion: "Provide a valid 'settings' object")
                throw err
            }

            var paymentHandling: PrimerPaymentHandling = .auto
            if let rnPaymentHandling = settingsJson["paymentHandling"] as? String,
               rnPaymentHandling == "MANUAL" {
                paymentHandling = .manual
            }

            let rnLocaleDataLanguageCode = (settingsJson["localeData"] as? [String: Any])?["languageCode"] as? String
            let rnLocaleDataLocaleCode = (settingsJson["localeData"] as? [String: Any])?["localeCode"] as? String
            let localeData = PrimerLocaleData(
                languageCode: rnLocaleDataLanguageCode,
                regionCode: rnLocaleDataLocaleCode)

            let rnUrlScheme = ((settingsJson["paymentMethodOptions"] as? [String: Any])?["iOS"] as? [String: Any])?["urlScheme"] as? String

            var applePayOptions: PrimerApplePayOptions?
            if let rnApplePayOptions = ((settingsJson["paymentMethodOptions"] as? [String: Any])?["applePayOptions"] as? [String: Any]),
               let rnApplePayMerchantIdentifier = rnApplePayOptions["merchantIdentifier"] as? String,
               let rnApplePayMerchantName = rnApplePayOptions["merchantName"] as? String
            {
                let rnApplePayIsCaptureBillingAddressEnabled = (rnApplePayOptions["isCaptureBillingAddressEnabled"] as? Bool) ?? false
                let rnApplePayShowApplePayForUnsupportedDevice = (rnApplePayOptions["showApplePayForUnsupportedDevice"] as? Bool) ?? true
                let rnApplePayCheckProvidedNetworks = (rnApplePayOptions["checkProvidedNetworks"] as? Bool) ?? true
                
                applePayOptions = PrimerApplePayOptions(
                    merchantIdentifier: rnApplePayMerchantIdentifier,
                    merchantName: rnApplePayMerchantName,
                    isCaptureBillingAddressEnabled: rnApplePayIsCaptureBillingAddressEnabled,
                    showApplePayForUnsupportedDevice: rnApplePayShowApplePayForUnsupportedDevice,
                    checkProvidedNetworks: rnApplePayCheckProvidedNetworks)
            }

            var klarnaOptions: PrimerKlarnaOptions?
            if let rnKlarnaRecurringPaymentDescription = ((settingsJson["paymentMethodOptions"] as? [String: Any])?["klarnaOptions"] as? [String: Any])?["recurringPaymentDescription"] as? String {
                klarnaOptions = PrimerKlarnaOptions(recurringPaymentDescription: rnKlarnaRecurringPaymentDescription)
            }

            var uiOptions: PrimerUIOptions?
            if let rnUIOptions = settingsJson["uiOptions"] as? [String: Any] {

                var theme: PrimerTheme?
                if let rnTheme = rnUIOptions["theme"] as? [String: Any] {
                    let rnThemeData = (try JSONSerialization.data(withJSONObject: rnTheme))
                    let rnTheme = try JSONDecoder().decode(PrimerThemeRN.self, from: rnThemeData)
                    theme = rnTheme.asPrimerTheme()
                }

                uiOptions = PrimerUIOptions(
                    isInitScreenEnabled: rnUIOptions["isInitScreenEnabled"] as? Bool,
                    isSuccessScreenEnabled: rnUIOptions["isSuccessScreenEnabled"] as? Bool,
                    isErrorScreenEnabled: rnUIOptions["isErrorScreenEnabled"] as? Bool,
                    theme: theme)
            }

            var debugOptions: PrimerDebugOptions?
            if let rnIs3DSSanityCheckEnabled = (settingsJson["debugOptions"] as? [String: Any])?["is3DSSanityCheckEnabled"] as? Bool {
                debugOptions = PrimerDebugOptions(is3DSSanityCheckEnabled: rnIs3DSSanityCheckEnabled)
            }
            
            var threeDsOptions: PrimerThreeDsOptions?
            if let rnThreeDsAppRequestorUrlStr = (((settingsJson["paymentMethodOptions"] as? [String: Any])?["threeDsOptions"] as? [String: Any])?["iOS"] as? [String: Any])?["threeDsAppRequestorUrl"] as? String {
                threeDsOptions = PrimerThreeDsOptions(threeDsAppRequestorUrl: rnThreeDsAppRequestorUrlStr)
            }

            let paymentMethodOptions = PrimerPaymentMethodOptions(
                urlScheme: rnUrlScheme,
                applePayOptions: applePayOptions,
                klarnaOptions: klarnaOptions,
                threeDsOptions: threeDsOptions)

            self.init(
                paymentHandling: paymentHandling,
                localeData: localeData,
                paymentMethodOptions: paymentMethodOptions,
                uiOptions: uiOptions,
                debugOptions: debugOptions)
        }
    }
}
