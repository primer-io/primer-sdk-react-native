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
    
    case onHUCTokenizeStart = 0
    case onHUCPrepareStart
    case onHUCAvailablePaymentMethodsLoaded
    case onHUCPaymentMethodShow
    case onTokenizeSuccess
    case onResumeSuccess
    case onBeforePaymentCreate
    case onBeforeClientSessionUpdate
    case onClientSessionUpdate
    case onCheckoutComplete
    case onError
    
    var stringValue: String {
        switch self {
        case .onHUCPrepareStart:
            return "onHUCPrepareStart"
        case .onHUCTokenizeStart:
            return "onHUCTokenizeStart"
        case .onHUCPaymentMethodShow:
            return "onHUCPaymentMethodShow"
        case .onTokenizeSuccess:
            return "onTokenizeSuccess"
        case .onResumeSuccess:
            return "onResumeSuccess"
        case .onBeforePaymentCreate:
            return "onBeforePaymentCreate"
        case .onBeforeClientSessionUpdate:
            return "onBeforeClientSessionUpdate"
        case .onClientSessionUpdate:
            return "onClientSessionUpdate"
        case .onCheckoutComplete:
            return "onCheckoutComplete"
        case .onHUCAvailablePaymentMethodsLoaded:
            return "onHUCAvailablePaymentMethodsLoaded"
        case .onError:
            return "onError"
        }
    }
}

@objc(PrimerHeadlessUniversalCheckout)
class RNTPrimerHeadlessUniversalCheckout: RCTEventEmitter {
    
    private var primerWillCreatePaymentWithDataDecisionHandler: ((_ errorMessage: String?) -> Void)?
    private var primerDidTokenizePaymentMethodDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    private var primerDidResumeWithDecisionHandler: ((_ resumeToken: String?, _ errorMessage: String?) -> Void)?
    private var primerDidFailWithErrorDecisionHandler: ((_ errorMessage: String) -> Void)?
    private var implementedRNCallbacks: ImplementedRNCallbacks?
    
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
                settings = try PrimerSettings.initialize(with: settingsStr)
            } catch {
                errorCallback([error.rnError])
                return
            }
        }
        
        PrimerHeadlessUniversalCheckout.current.start(withClientToken: clientToken, settings: settings, delegate: self) { paymentMethodTypes, err in
            if let err = err {
                errorCallback([err.rnError])
            } else if let paymentMethodTypes = paymentMethodTypes {
                successCallback([paymentMethodTypes])
            }
        }
    }
    
    @objc
    public func getAssetForPaymentMethodType(_ paymentMethodTypeStr: String,
                                             assetType assetTypeStr: String,
                                             errorCallback: @escaping RCTResponseSenderBlock,
                                             successCallback: @escaping RCTResponseSenderBlock)
    {
        guard let image = PrimerHeadlessUniversalCheckout.getAsset(for: paymentMethodTypeStr, assetType: PrimerAsset.ImageType(rawValue: assetTypeStr)!) else {
            let err = NativeError(errorId: "missing-asset", errorDescription: "Failed to find \(assetTypeStr) for \(paymentMethodTypeStr)", recoverySuggestion: nil)
            errorCallback([err.rnError])
            return
        }
        
        do {
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
        
        do {
            let imageURL = try self.tempStoreImage(image: image, name: cardNetworkStr)
            successCallback([imageURL.absoluteString])
        } catch {
            errorCallback([error.rnError])
        }
    }
    
    @objc
    public func showPaymentMethod(_ paymentMethodTypeStr: String,
                                  resolver: RCTPromiseResolveBlock,
                                  rejecter: RCTPromiseRejectBlock)
    {
        PrimerHeadlessUniversalCheckout.current.showPaymentMethod(paymentMethodTypeStr)
        resolver(nil)
    }
    
    @objc
    public func disposePrimerHeadlessUniversalCheckout() {
        
    }
    
    // MARK: - HELPERS
    
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
    
    // MARK: - DECISION HANDLERS
    
    // MARK: Tokenization
    
    @objc
    public func handleTokenizationNewClientToken(_ newClientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(newClientToken, nil)
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handleTokenizationSuccess(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(nil, nil)
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "PrimerTokenizationHandler's handleSuccess function is not available on HUC."])
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
        }
    }
    
    @objc
    public func handleTokenizationFailure(_ errorMessage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidTokenizePaymentMethodDecisionHandler?(nil, errorMessage ?? "")
            self.primerDidTokenizePaymentMethodDecisionHandler = nil
            let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "PrimerTokenizationHandler's handleFailure function is not available on HUC."])
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
        }
    }
    
    // MARK: Resume Payment
    
    @objc
    public func handleResumeWithNewClientToken(_ newClientToken: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerDidResumeWithDecisionHandler?(newClientToken, nil)
            self.primerDidResumeWithDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handleResumeSuccess(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "PrimerResumeHandler's handleSuccess function is not available on HUC."])
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
        }
    }
    
    @objc
    public func handleResumeFailure(_ errorMessage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "PrimerResumeHandler's handleFailure function is not available on HUC."])
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
        }
    }
    
    // MARK: Payment Creation
    
    @objc
    public func handlePaymentCreationAbort(_ errorMessage: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerWillCreatePaymentWithDataDecisionHandler?(errorMessage ?? "")
            self.primerWillCreatePaymentWithDataDecisionHandler = nil
            resolver(nil)
        }
    }
    
    @objc
    public func handlePaymentCreationContinue(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            self.primerWillCreatePaymentWithDataDecisionHandler?(nil)
            self.primerWillCreatePaymentWithDataDecisionHandler = nil
            resolver(nil)
        }
    }
    
    // MARK: Helpers
    
    private func detectImplemetedCallbacks() {
        sendEvent(withName: PrimerEvents.detectImplementedRNCallbacks.stringValue, body: nil)
    }
    
    @objc
    public func setImplementedRNCallbacks(_ implementedRNCallbacksStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            do {
                guard let implementedRNCallbacksData = implementedRNCallbacksStr.data(using: .utf8) else {
                    let err = NSError(domain: "native-bridge", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
                    throw err
                }
                self.implementedRNCallbacks = try JSONDecoder().decode(ImplementedRNCallbacks.self, from: implementedRNCallbacksData)
                resolver(nil)
            } catch {
                self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: false)
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }
    
    private func handleRNBridgeError(_ error: Error, checkoutData: PrimerCheckoutData?, stopOnDebug: Bool) {
        DispatchQueue.main.async {
            if stopOnDebug {
                assertionFailure(error.localizedDescription)
            }
            
            var body: [String: Any] = ["error": error.rnError]
            if let checkoutData = checkoutData,
               let data = try? JSONEncoder().encode(checkoutData),
               let json = try? JSONSerialization.jsonObject(with: data){
                body["checkoutData"] = json
            }

            self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onError.stringValue, body: body)
        }
    }
}

// MARK: - EVENTS

extension RNTPrimerHeadlessUniversalCheckout: PrimerHeadlessUniversalCheckoutDelegate {
    
    func primerHeadlessUniversalCheckoutPreparationDidStart(for paymentMethodType: String) {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onHUCPrepareStart.stringValue, body: ["paymentMethodType": paymentMethodType])
    }
    
    func primerHeadlessUniversalCheckoutTokenizationDidStart(for paymentMethodType: String) {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onHUCTokenizeStart.stringValue, body: ["paymentMethodType": paymentMethodType])
    }
    
    func primerHeadlessUniversalCheckoutDidLoadAvailablePaymentMethods(_ paymentMethodTypes: [String]) {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onHUCAvailablePaymentMethodsLoaded.stringValue, body: ["paymentMethodTypes": paymentMethodTypes])
    }
    
    func primerHeadlessUniversalCheckoutPaymentMethodDidShow(for paymentMethodType: String) {
        sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onHUCPaymentMethodShow.stringValue, body: ["paymentMethodType": paymentMethodType])
    }
    
    func primerHeadlessUniversalCheckoutDidTokenizePaymentMethod(_ paymentMethodTokenData: PrimerPaymentMethodTokenData, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
        if self.implementedRNCallbacks?.isOnTokenizeSuccessImplemented == true {
            self.primerDidTokenizePaymentMethodDecisionHandler = { (newClientToken, errorMessage) in
                DispatchQueue.main.async {
                    if let errorMessage = errorMessage {
                        decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                    } else if let newClientToken = newClientToken {
                        decisionHandler(.continueWithNewClientToken(newClientToken))
                    } else {
                        decisionHandler(.succeed())
                    }
                }
            }
            
            do {
                let data = try JSONEncoder().encode(paymentMethodTokenData)
                let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
                DispatchQueue.main.async {
                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onTokenizeSuccess.stringValue, body: json)
                }
            } catch {
                self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
            }
        } else {
            // RN dev hasn't opted in on listening the tokenization callback.
            // Throw an error if it's the manual flow, ignore if it's the
            // auto flow.
        }
    }
    
    func primerHeadlessUniversalCheckoutDidResumeWith(_ resumeToken: String, decisionHandler: @escaping (PrimerResumeDecision) -> Void) {
        if self.implementedRNCallbacks?.isOnResumeSuccessImplemented == true {
            self.primerDidResumeWithDecisionHandler = { (resumeToken, errorMessage) in
                DispatchQueue.main.async {
                    if let errorMessage = errorMessage {
                        decisionHandler(.fail(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                    } else if let resumeToken = resumeToken {
                        decisionHandler(.continueWithNewClientToken(resumeToken))
                    } else {
                        decisionHandler(.succeed())
                    }
                }
            }
            
            DispatchQueue.main.async {
                self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onResumeSuccess.stringValue, body: ["resumeToken": resumeToken])
            }
        } else {
            // RN dev hasn't opted in on listening the tokenization callback.
            // Throw an error if it's the manual flow.
        }
    }
    
    func primerHeadlessUniversalCheckoutDidFail(withError err: Error) {
        if self.implementedRNCallbacks?.isOnErrorImplemented == true {
            // Send the error message to the RN bridge.
            self.handleRNBridgeError(err, checkoutData: nil, stopOnDebug: false)
            
        } else {
            // RN dev hasn't opted in on listening SDK dismiss.
            // Ignore!
        }
    }
    
    func primerHeadlessUniversalCheckoutDidCompleteCheckoutWithData(_ data: PrimerCheckoutData) {
        DispatchQueue.main.async {
            if self.implementedRNCallbacks?.isOnCheckoutCompleteImplemented == true {
                do {
                    let checkoutData = try JSONEncoder().encode(data)
                    let checkoutJson = try JSONSerialization.jsonObject(with: checkoutData, options: .allowFragments)
                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onCheckoutComplete.stringValue, body: checkoutJson)
                } catch {
                    self.handleRNBridgeError(error, checkoutData: data, stopOnDebug: true)
                }
            } else {
                let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Callback [onCheckoutComplete] should be implemented."])
                self.handleRNBridgeError(err, checkoutData: data, stopOnDebug: false)
            }
        }
    }
    
    func primerHeadlessUniversalCheckoutClientSessionWillUpdate() {
        if self.implementedRNCallbacks?.isOnBeforeClientSessionUpdateImplemented == true {
            DispatchQueue.main.async {
                self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onBeforeClientSessionUpdate.stringValue, body: nil)
            }
        } else {
            // RN Dev hasn't implemented this callback, ignore.
        }
    }
    
    func primerHeadlessUniversalCheckoutClientSessionDidUpdate(_ clientSession: PrimerClientSession) {
        if self.implementedRNCallbacks?.isOnClientSessionUpdateImplemented == true {
            do {
                let data = try JSONEncoder().encode(clientSession)
                let json = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
                DispatchQueue.main.async {
                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onClientSessionUpdate.stringValue, body: json)
                }
            } catch {
                self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
            }
        } else {
            // RN Dev hasn't implemented this callback, ignore.
        }
    }
    
    func primerHeadlessUniversalCheckoutWillCreatePaymentWithData(_ data: PrimerCheckoutPaymentMethodData, decisionHandler: @escaping (PrimerPaymentCreationDecision) -> Void) {
        if self.implementedRNCallbacks?.isOnBeforePaymentCreateImplemented == true {
            self.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
                DispatchQueue.main.async {
                    if let errorMessage = errorMessage {
                        decisionHandler(.abortPaymentCreation(withErrorMessage: errorMessage.isEmpty ? nil : errorMessage))
                    } else {
                        decisionHandler(.continuePaymentCreation())
                    }
                }
            }
            
            DispatchQueue.main.async {
                do {
                    let checkoutPaymentmethodData = try JSONEncoder().encode(data)
                    let checkoutPaymentmethodJson = try JSONSerialization.jsonObject(with: checkoutPaymentmethodData, options: .allowFragments)
                    self.sendEvent(withName: PrimerHeadlessUniversalCheckoutEvents.onBeforePaymentCreate.stringValue, body: checkoutPaymentmethodJson)
                } catch {
                    self.handleRNBridgeError(error, checkoutData: nil, stopOnDebug: true)
                }
            }
        } else {
            // RN Dev hasn't implemented this callback, send a decision to continue the flow.
            DispatchQueue.main.async {
                decisionHandler(.continuePaymentCreation())
            }
        }
    }
}
