//@objc(UniversalCheckoutRN)
//class UniversalCheckoutRN: NSObject {
//    @objc(multiply:withB:withResolver:withRejecter:)
//    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
//        resolve(a*b)
//    }
//}

import PrimerSDK

@objc(UniversalCheckoutRN)
class UniversalCheckout: NSObject {
    var clientToken: String?
    var primer: Primer?
    
    @objc(initialize:token:)
    func initialize(token: String) {}
    
    @objc(loadPaymentMethods)
    func loadPaymentMethods() {}
    
    @objc(dismiss)
    func dismiss() {}
    
    @objc(showSuccess)
    func showSuccess() {}
    
    @objc(show)
    func show() {}
    
    @objc(destroy)
    func destroy() {}
}
//
//import UIKit
//import PrimerSDK
//class ViewController: UIViewController {
//    @IBAction func checkout() {
//        print("money money money")
//        primer?.showCheckout(with: self)
//    }
//    var primer: Primer?
//    override func viewDidLoad() {
//        super.viewDidLoad()
//        // wrapper will have to enable adding this object + Primer class & Primer.showCheckout(with: ViewController)
//        let settings = PrimerSettings(
//            amount: 200,
//            currency: .EUR,
//            clientTokenRequestCallback: { token in },
//            onTokenizeSuccess: { (clientToken, token) in } //
//            )
//        primer = Primer(with: settings)
//    }
//}
