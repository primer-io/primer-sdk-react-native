import PrimerSDK

extension PrimerSettings {

    static func initialize(with settingsStr: String?) throws -> PrimerSettings {
        guard let settingsStr = settingsStr,
              let settingsData = settingsStr.data(using: .utf8)
        else {
            return PrimerSettings()
        }
        
        guard let settingsJson = (try JSONSerialization.jsonObject(with: settingsData)) as? [String: Any]
        else {
            return PrimerSettings()
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
           let rnApplePayMerchantName = rnApplePayOptions["merchantName"] as? String,
           let rnApplePayIsCaptureBillingAddressEnabled = rnApplePayOptions["isCaptureBillingAddressEnabled"] as? Bool {
            applePayOptions = PrimerApplePayOptions(merchantIdentifier: rnApplePayMerchantIdentifier, merchantName: rnApplePayMerchantName, isCaptureBillingAddressEnabled: rnApplePayIsCaptureBillingAddressEnabled)
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
        
        let paymentMethodOptions = PrimerPaymentMethodOptions(
            urlScheme: rnUrlScheme,
            applePayOptions: applePayOptions,
            klarnaOptions: klarnaOptions)
        
        let settings = PrimerSettings(
            paymentHandling: paymentHandling,
            localeData: localeData,
            paymentMethodOptions: paymentMethodOptions,
            uiOptions: uiOptions,
            debugOptions: debugOptions)
        
        
        return settings
    }
}
