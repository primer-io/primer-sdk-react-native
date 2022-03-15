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
        switch self {
        case .clientSessionDidSetUpSuccessfully:
            return "clientSessionDidSetUpSuccessfully"
        case .preparationStarted:
            return "preparationStarted"
        case .paymentMethodPresented:
            return "paymentMethodPresented"
        case .tokenizationStarted:
            return "tokenizationStarted"
        case .tokenizationSucceeded:
            return "tokenizationSucceeded"
        case .resume:
            return "resume"
        case .error:
            return "error"
        }
    }
}

@objc(PrimerHeadlessUniversalCheckout)
class RNTPrimerHeadlessUniversalCheckout: RCTEventEmitter {
    
    private var resumeTokenCompletion: ((_ resumeToken: String) -> Void)?
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override init() {
        super.init()
        PrimerHeadlessUniversalCheckout.current.delegate = self
    }
    
    override func supportedEvents() -> [String]! {
        return PrimerHeadlessUniversalCheckoutEvents.allCases.compactMap({ $0.stringValue })
    }
    
    // MARK: - API
    
    @objc
    public func startWithClientToken(_ clientToken: String,
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
    public func resumeWithClientToken(_ resumeToken: String) {
        self.resumeTokenCompletion?(resumeToken)
    }
    
    @objc
    public func getAssetForPaymentMethodType(_ paymentMethodTypeStr: String,
                                             assetType assetTypeStr: String,
                                             errorCallback: @escaping RCTResponseSenderBlock,
                                             successCallback: @escaping RCTResponseSenderBlock)
    {
        do {
            try validate(assetStr: paymentMethodTypeStr, assetTypeStr: assetTypeStr)
            let paymentMethodType = PaymentMethodConfigType(rawValue: paymentMethodTypeStr)
            
            guard let image = PrimerHeadlessUniversalCheckout.getAsset(for: paymentMethodType, assetType: PrimerAsset.ImageType(rawValue: assetTypeStr)!) else {
                let err = NativeError(errorId: "missing-asset", errorDescription: "Failed to find \(assetTypeStr) for \(paymentMethodTypeStr)", recoverySuggestion: nil)
                errorCallback([err.rnError])
                return
            }
            
            
            let imageURL = try self.tempStoreImage(image: image, name: paymentMethodTypeStr)
            successCallback([imageURL.absoluteString])
        } catch {
            errorCallback([error.rnError])
        }
    }
    
    @objc
    public func getAssetForCardNetwork(_ cardNetworkStr: String,
                                       assetType assetTypeStr: String,
                                       errorCallback: @escaping RCTResponseSenderBlock,
                                       successCallback: @escaping RCTResponseSenderBlock)
    {
        do {
            try validate(assetStr: cardNetworkStr, assetTypeStr: assetTypeStr)
            guard let cardNetwork = CardNetwork(rawValue: cardNetworkStr) else {
                let err = NativeError(errorId: "invalid-card-network", errorDescription: "Card network for \(cardNetworkStr) does not exist, make sure you don't have any typos.", recoverySuggestion: nil)
                errorCallback([err.rnError])
                return
            }
            
            guard let image = PrimerHeadlessUniversalCheckout.getAsset(for: cardNetwork, assetType: PrimerAsset.ImageType(rawValue: assetTypeStr)!) else {
                let err = NativeError(errorId: "missing-asset", errorDescription: "Failed to find \(assetTypeStr) for \(cardNetworkStr)", recoverySuggestion: nil)
                errorCallback([err.rnError])
                return
            }
            
            
            let imageURL = try self.tempStoreImage(image: image, name: cardNetworkStr)
            successCallback([imageURL.absoluteString])
        } catch {
            errorCallback([error.rnError])
        }
    }
    
    @objc
    public func showPaymentMethod(_ paymentMethodTypeStr: String) {
        let paymentMethodType = PrimerPaymentMethodType(rawValue: paymentMethodTypeStr)
        PrimerHeadlessUniversalCheckout.current.showPaymentMethod(paymentMethodType)
    }
    
    // MARK: - HELPERS
    
    private func validate(assetStr: String, assetTypeStr: String) throws {
        var errors: [NativeError] = []
        
        if PaymentMethodConfigType(rawValue: assetStr) != .other(rawValue: assetStr) {
            // ...
        } else if CardNetwork(rawValue: assetStr) != nil {
            // ...
        } else {
            let err = NativeError(errorId: "invalid-payment-method-type", errorDescription: "Asset for \(assetStr) does not exist, make sure you don't have any typos.", recoverySuggestion: nil)
            errors.append(err)
        }
        
        
        if PrimerAsset.ImageType(rawValue: assetTypeStr) == nil {
            let err = NativeError(errorId: "mismatch", errorDescription: "You have provided assetType=\(assetTypeStr), which is not valid", recoverySuggestion: "Use one of the following values: \(PrimerAsset.ImageType.allCases.compactMap({ $0.rawValue }))")
            errors.append(err)
        }
        
        if errors.isEmpty {
            return
        } else if errors.count == 1 {
            throw errors.first!
        } else {
            let errorDescription: String = errors.compactMap({ $0.errorDescription }).joined(separator: "/n")
            let recoverySuggestion = errors.compactMap({ $0.recoverySuggestion }).joined(separator: "/n")
            let err = NativeError(errorId: "underlying-errors", errorDescription: errorDescription, recoverySuggestion: recoverySuggestion)
            throw err
        }
    }
    
    private func tempStoreImage(image: UIImage, name: String) throws -> URL {
        guard let imageURL = NSURL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("\(name).png") else {
            let err = NativeError(errorId: "error", errorDescription: "Failed to create URL for asset", recoverySuggestion: nil)
            throw err
        }
        
        guard let pngData = image.pngData() else {
            let err = NativeError(errorId: "error", errorDescription: "Failed to get image's PNG data", recoverySuggestion: nil)
            throw err
        }
        
        try pngData.write(to: imageURL)
        return imageURL
    }
}

// MARK: - EVENTS

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
            
            self.resumeTokenCompletion = { (resumeToken) in
                resumeHandler?.handle(newClientToken: resumeToken)
            }
            
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
