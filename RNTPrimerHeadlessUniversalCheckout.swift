//
//  RNTPrimerHeadlessUniversalCheckout.swift
//  primer-io-react-native
//
//  Created by Evangelos on 8/3/22.
//

import Foundation
import PrimerSDK

@objc
enum PrimerHeadlessUniversalCheckoutEvents: Int, CaseIterable {
    case clientSessionDidSetUpSuccessfully = 0
    case preparationStarted
    case paymentMethodPresented
    case tokenizationStarted
    case tokenizationSucceeded
    case resume
    case error
    
    var stringValue: String {
      String(describing: self)
    }
}

@objc(PrimerHeadlessUniversalCheckout)
class RNTPrimerHeadlessUniversalCheckout: RCTEventEmitter {
    
    override init() {
        super.init()
        PrimerHeadlessUniversalCheckout.current.delegate = self
    }
    
    override func supportedEvents() -> [String]! {
        return PrimerHeadlessUniversalCheckoutEvents.allCases.compactMap({ $0.stringValue })
    }

    @objc
    func startWithClientToken(_ clientToken: String,
                              settingsStr: String?,
                              errorCallback: @escaping RCTResponseSenderBlock,
                              successCallback: @escaping RCTResponseSenderBlock)
    {
        var settings: PrimerSettings?
        if let settingsStr = settingsStr {
            do {
                let settingsData = settingsStr.data(using: .utf8)!
                let settingsRN = try JSONDecoder().decode(PrimerSettingsRN.self, from: settingsData)
                settings = settingsRN.asPrimerSettings()
            } catch {
                errorCallback([error.rnError])
                return
            }
        }
                
        PrimerHeadlessUniversalCheckout.current.start(withClientToken: clientToken, settings: settings, delegate: self) { paymentMethodTypes, err in
            if let err = err {
                errorCallback([err.rnError])
            } else if let paymentMethodTypes = paymentMethodTypes {
                successCallback([paymentMethodTypes.compactMap({$0.rawValue})])
            }
        }
    }
    
    @objc
    func getAssetFor(_ assetBrand: String,
                     assetType: String,
                     errorCallback: @escaping RCTResponseSenderBlock,
                     successCallback: @escaping RCTResponseSenderBlock)
    {
        guard let brand = PrimerAsset.Brand(rawValue: assetBrand) else {
            let err = NativeError(errorId: "missing-asset", errorDescription: "Asset for \(assetBrand) does not exist, make sure you don't have any typos.", recoverySuggestion: nil)
            errorCallback([err.rnError])
            return
        }
        
        guard (assetType == "logo" || assetType == "icon") else {
            let err = NativeError(errorId: "mismatch", errorDescription: "You have provided assetType=\(assetType), but variable assetType can be 'logo' or 'icon'.", recoverySuggestion: nil)
            errorCallback([err.rnError])
            return
        }
        
        guard let image = PrimerHeadlessUniversalCheckout.getAsset(for: brand, assetType: .logo) else {
            let err = NativeError(errorId: "missing-asset", errorDescription: "Failed to find \(assetType) for \(brand.rawValue)", recoverySuggestion: nil)
            errorCallback([err.rnError])
            return
        }
        
        guard let imageURL = NSURL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("\(assetBrand).png") else {
            let err = NativeError(errorId: "error", errorDescription: "Failed to create URL for asset", recoverySuggestion: nil)
            errorCallback([err.rnError])
            return
        }

        let pngData = image.pngData()
        do {
            try pngData?.write(to: imageURL)
            successCallback([imageURL.absoluteString])
        } catch {
            errorCallback([error.rnError])
        }
    }
    
    @objc
    func showPaymentMethod(_ paymentMethodTypeStr: String) {
        let paymentMethodType = PrimerPaymentMethodType(rawValue: paymentMethodTypeStr)
        PrimerHeadlessUniversalCheckout.current.showPaymentMethod(paymentMethodType)
    }
    
}

extension RNTPrimerHeadlessUniversalCheckout: PrimerHeadlessUniversalCheckoutDelegate {
    func primerHeadlessUniversalCheckoutClientSessionDidSetUpSuccessfully() {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.clientSessionDidSetUpSuccessfully.stringValue, body: nil)
    }
    
    func primerHeadlessUniversalCheckoutPreparationStarted() {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.preparationStarted.stringValue, body: nil)
    }
    
    func primerHeadlessUniversalCheckoutTokenizationStarted() {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.tokenizationStarted.stringValue, body: nil)
    }
    
    func primerHeadlessUniversalCheckoutPaymentMethodPresented() {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.paymentMethodPresented.stringValue, body: nil)
    }
    
    func primerHeadlessUniversalCheckoutTokenizationSucceeded(paymentMethodToken: PaymentMethodToken, resumeHandler: ResumeHandlerProtocol?) {
        do {
            let paymentMethodTokenData = try JSONEncoder().encode(paymentMethodToken)
            let paymentMethodTokenStr = String(data: paymentMethodTokenData, encoding: .utf8)!
            sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.tokenizationSucceeded.stringValue, body: ["paymentMethodToken": paymentMethodTokenStr])

        } catch {
            self.primerHeadlessUniversalCheckoutUniversalCheckoutDidFail(withError: error)
        }
    }
    
    func primerHeadlessUniversalCheckoutResume(withResumeToken resumeToken: String, resumeHandler: ResumeHandlerProtocol?) {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.resume.stringValue, body: ["resumeToken": resumeToken])
    }
    
    func primerHeadlessUniversalCheckoutUniversalCheckoutDidFail(withError err: Error) {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.error.stringValue, body: ["error": err.rnError])
    }
}
