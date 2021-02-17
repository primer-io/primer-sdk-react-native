import Foundation
import UIKit
import PrimerSDK

@objc(UniversalCheckoutRN)
class UniversalCheckout: NSObject {
    
    var primer: Primer?
    var delegate: PrimerCheckoutDelegate?
    
    @objc func initialize(_ data: NSDictionary, callback: @escaping RCTResponseSenderBlock) -> Void {
        DispatchQueue.main.async {
            
            var lightTheme = PrimerDefaultTheme()
            
            var cornerRadiusTheme: CornerRadiusTheme?
            
            var textFieldTheme: PrimerTextFieldTheme = .outlined
            
            if let themeData = data["theme"] as? NSDictionary {
                let colorThemeData = themeData["colorTheme"] as! NSDictionary

                for (key, value) in colorThemeData {

                    guard let val = value as? NSDictionary else { return }

                    let clr = UIColor(
                        red: val["red"] as! CGFloat/255,
                        green: val["green"] as! CGFloat/255,
                        blue: val["blue"] as! CGFloat/255,
                        alpha: 1
                    )
                    
                    print(clr, key)

                    switch key as! String {
                    case "text1": lightTheme.text1 = clr
                    case "text2": lightTheme.text2 = clr
                    case "text3": lightTheme.text3 = clr
                    case "secondaryText1": lightTheme.secondaryText1 = clr
                    case "main1": lightTheme.main1 = clr
                    case "main2": lightTheme.main2 = clr
                    case "tint1": lightTheme.tint1 = clr
                    case "neutral1": lightTheme.neutral1 = clr
                    case "disabled1": lightTheme.disabled1 = clr
                    case "error1": lightTheme.error1 = clr
                    default: break
                    }
                    
                    
                }
                
                if let textFieldThemeData = themeData["textFieldTheme"] {
                    switch textFieldThemeData as! String {
                    case "outlined":
                        textFieldTheme = .outlined
                    case "doublelined":
                        textFieldTheme = .doublelined
                    case "underlined":
                        textFieldTheme = .underlined
                    default: break
                    }
                }
                
                print(themeData)
                
                let cornerRadiusThemeData = themeData["cornerRadiusTheme"] as? NSDictionary
                
                cornerRadiusTheme = CornerRadiusTheme(
                    buttons: cornerRadiusThemeData?["buttons"] as? CGFloat ?? 4,
                    textFields: cornerRadiusThemeData?["textFields"] as? CGFloat ?? 2,
                    sheetView: cornerRadiusThemeData?["sheetView"] as? CGFloat ?? 12,
                    confirmMandateList: cornerRadiusThemeData?["confirmMandateList"] as? CGFloat ?? 0
                )
                
                print(textFieldTheme)
                
            }
            
            print(lightTheme)
            
            var theme: PrimerTheme
            
            if #available(iOS 13.0, *) {
                theme = PrimerTheme(
                    cornerRadiusTheme: cornerRadiusTheme ?? CornerRadiusTheme(),
                    colorTheme: PrimerDefaultTheme(neutral1: .blue),
                    darkTheme: lightTheme,
                    layout: PrimerLayout(showTopTitle: false, textFieldHeight: 56),
                    textFieldTheme: textFieldTheme,
                    fontTheme: PrimerFontTheme(mainTitle: .boldSystemFont(ofSize: 24))
                )
            } else {
                theme = PrimerTheme(
                    cornerRadiusTheme: cornerRadiusTheme ?? CornerRadiusTheme(),
                    colorTheme: lightTheme,
                    layout: PrimerLayout(showMainTitle: true, showTopTitle: false),
                    textFieldTheme: textFieldTheme,
                    fontTheme: PrimerFontTheme(mainTitle: .boldSystemFont(ofSize: 24))
                )
            }
            
            let businessDetailsData = data["businessDetails"] as! NSDictionary
            let addressData = businessDetailsData["address"] as! NSDictionary
            
            // business details
            let address = Address(
                addressLine1: addressData["addressLine1"] as? String,
                addressLine2: addressData["addressLine2"] as? String,
                city: addressData["city"] as? String,
                state: addressData["state"] as? String,
                countryCode: addressData["countryCode"] as? String,
                postalCode: addressData["postalCode"] as? String
            )
            
            let businessDetails = BusinessDetails(
                name: businessDetailsData["name"] as! String,
                address: address
            )
            
            let tokenResponse = data["clientTokenData"] as! NSDictionary
            
            self.delegate = CheckoutDelegate(
                tokenResponse: tokenResponse, callback: callback
            )
            
            guard let delegate = self.delegate else { return }
            
            let amount = data["amount"] as! Int
            let currency = Currency(rawValue: data["currency"] as! String)!
            let customerId = data["customerId"] as! String
            let countryCode = CountryCode(rawValue: data["countryCode"] as! String)!
            let urlScheme: String = "primer://oauth"
            let urlSchemeIdentifier: String = "primer"
            
            let settings = PrimerSettings(
                delegate: delegate,
                amount: amount,
                currency: currency,
                theme: theme,
                customerId: customerId,
                countryCode: countryCode,
                urlScheme: urlScheme,
                urlSchemeIdentifier: urlSchemeIdentifier,
                isFullScreenOnly: true,
                businessDetails: businessDetails
            )
            
            self.primer = Primer(with: settings)
            
            self.primer?.setDependencies(settings: settings)
            
            self.setDirectDebitDetails(data["customerDetails"] as? NSDictionary)
            
            print("🪢", theme)
            
            self.primer?.setTheme(theme: theme)
            
        }
    }
    
    // set theme
    @objc func setTheme(_ data: NSDictionary) {
        
    }
    
    // set direct debit details
    @objc func setDirectDebitDetails(_ data: NSDictionary?) {
        guard let data = data else { return }
        let firstName: String = data["firstName"] as? String ?? ""
        let lastName: String = data["lastName"] as? String ?? ""
        let email: String = data["email"] as? String ?? ""
        let iban: String = data["iban"] as? String ?? ""
        let addressLine1: String = data["addressLine1"] as? String ?? ""
        let addressLine2: String? = data["addressLine2"] as? String
        let city: String = data["city"] as? String ?? ""
        let state: String? = data["state"] as? String
        let countryCode: String = data["countryCode"] as? String ?? ""
        let postalCode: String = data["postalCode"] as? String ?? ""
        
        self.primer?.setDirectDebitDetails(
            firstName: firstName,
            lastName: lastName,
            email: email,
            iban: iban,
            address: Address(
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                city: city,
                state: state,
                countryCode: countryCode,
                postalCode: postalCode
            )
        )
    }
    
    
    @objc func loadDirectDebitView() -> Void {
        
        DispatchQueue.main.async { [weak self] in
            
            guard let vc = RCTPresentedViewController() else { return }
            
            self?.primer?.showCheckout(vc, flow: .addDirectDebit)
            
        }
        
    }
    
    @objc func loadPaymentMethods(_ callback: @escaping RCTResponseSenderBlock) -> Void {
        primer!.fetchVaultedPaymentMethods({ result in
            
            switch result {
            case .failure: break
            case .success(let arr):
                do {
                    
                    let data = try JSONEncoder().encode(arr)
                    
                    let str = String(data: data, encoding: .utf8)
                    
                    callback([str ?? "[]"])
                    
                } catch {
                    
                }
            }
        })
    }
    
    @objc func dismissCheckout() -> Void {
        primer?.dismiss()
    }
}

class CheckoutDelegate: PrimerCheckoutDelegate {
    
    var tokenResponse: NSDictionary
    var callback: RCTResponseSenderBlock
    
    func clientTokenCallback(_ completion: @escaping (Result<CreateClientTokenResponse, Error>) -> Void) {
        
        do {
            
            var codableDict = [String:String]()
            
            codableDict["clientToken"] = tokenResponse["clientToken"] as? String
            codableDict["expirationDate"] = tokenResponse["expirationDate"] as? String
            
            let payload = try JSONEncoder().encode(codableDict)
            
            let res = try JSONDecoder().decode(CreateClientTokenResponse.self, from: payload)
            
            completion(.success(res))
            
        } catch {
            
            completion(.failure(error))
            
        }
    }
    
    func authorizePayment(_ result: PaymentMethodToken, _ completion: @escaping (Error?) -> Void) {
        
        do {
            let payload = try JSONEncoder().encode(result)
            
            self.callback([payload])
        } catch {
            
        }
    }
    
    func onCheckoutDismissed() {
        
    }
    
    init(tokenResponse: NSDictionary, callback: @escaping RCTResponseSenderBlock) {
        self.tokenResponse = tokenResponse
        self.callback = callback
    }
}
