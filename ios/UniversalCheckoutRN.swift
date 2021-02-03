import Foundation
import UIKit
import PrimerSDK

@objc(UniversalCheckoutRN)
class UniversalCheckout: NSObject {
    
    var primer: Primer?
    
    @objc func initialize(_ data: NSDictionary, callback: @escaping RCTResponseSenderBlock) -> Void {
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 4) {
            
            let address = Address(
                addressLine1: "107 Rue de Rivoli",
                addressLine2: nil,
                city: "Paris",
                state: nil,
                countryCode: "FR",
                postalCode: "75001"
            )
            
            do {
                let payload = try JSONEncoder().encode(address)
                let str = String(data: payload, encoding: .utf8)
                callback([data["theme"]])
            } catch {
                
            }
        }
        
        DispatchQueue.main.async {
            
            var theme: PrimerTheme
            
            // let themeColor = UIColor(red: 45/255, green: 80/255, blue: 230/255, alpha: 1)

            // create colors from variables

            
            if #available(iOS 13.0, *) {

                theme = PrimerTheme.initialiseWithDarkTheme(
                    // todo: color theme
                    layout: PrimerLayout(showMainTitle: true, showTopTitle: false),
                    textFieldTheme: .doublelined,
                    fontTheme: PrimerFontTheme(mainTitle: .boldSystemFont(ofSize: 24))
                )

            } else {

                theme = PrimerTheme.initialise(
                    // todo: color theme
                    layout: PrimerLayout(showMainTitle: true, showTopTitle: false),
                    textFieldTheme: .doublelined,
                    fontTheme: PrimerFontTheme(mainTitle: .boldSystemFont(ofSize: 24))
                )
            }
            
            let tokenResponse = data["clientTokenData"] as! NSDictionary
            
            let delegate = CheckoutDelegate(
                tokenResponse: tokenResponse, callback: callback
            )
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
                urlSchemeIdentifier: urlSchemeIdentifier
            )
            
            self.primer = Primer(with: settings)
            
        }
    }
    
    @objc func loadDirectDebitView() -> Void {
        
        DispatchQueue.main.async { [weak self] in
            
            guard let vc = RCTPresentedViewController() else { return }
            self?.primer?.showCheckout(vc, flow: .addDirectDebit)
            
        }
        
    }
    
    @objc func loadPaymentMethods(_ callback: @escaping RCTResponseSenderBlock) -> Void {
        primer?.fetchVaultedPaymentMethods() { result in
            switch result {
            case .failure: break
            case .success(let arr):
                do {
                    
                    let data = try JSONEncoder().encode(arr)
                    
                    callback([data])
                    
                } catch {
                    
                }
            }
        }
    }
    
    @objc func dismissCheckout() -> Void {
        // primer?.dismissCheckout()
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
