//
//  RNTPrimerHeadlessUniversalCheckoutRawDataManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 3/8/22.
//

import Foundation
import PrimerSDK

@objc
enum PrimerHeadlessUniversalCheckoutRawDataManagerEvents: Int, CaseIterable {

    case onMetadataChange = 0
    case onValidation
    case onNativeError

    var stringValue: String {
        switch self {
        case .onMetadataChange:
            return "onMetadataChange"
        case .onValidation:
            return "onValidation"
        case .onNativeError:
            return "onNativeError"
        }
    }
}

@objc(PrimerHeadlessUniversalCheckoutRawDataManager)
class RNTPrimerHeadlessUniversalCheckoutRawDataManager: RCTEventEmitter {

    private var rawDataManager: PrimerHeadlessUniversalCheckout.RawDataManager!
    private var paymentMethodType: String?

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return PrimerHeadlessUniversalCheckoutRawDataManagerEvents.allCases.compactMap({ $0.stringValue })
    }

    // MARK: - API

    @objc
    public func initialize(
        _ paymentMethodTypeStr: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        self.paymentMethodType = paymentMethodTypeStr

        do {
            self.rawDataManager = try PrimerHeadlessUniversalCheckout.RawDataManager(paymentMethodType: self.paymentMethodType!)
            self.rawDataManager.delegate = self
            resolver(nil)
        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }
    
    @objc
    public func configure(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        
        guard let rawDataManager = rawDataManager else {
            let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "The PrimerHeadlessUniversalCheckoutRawDataManager has not been initialized. Make sure you have called the PrimerHeadlessUniversalCheckoutRawDataManager.initialize function first."])
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
            return
        }

        rawDataManager.configure { data, error in
            do {
                guard error == nil else {
                    rejecter(error!.rnError["errorId"]!, error!.rnError["description"], error)
                    return
                }
                let initializationData = try JSONEncoder().encode(data)
                let initializationDataJson = try JSONSerialization.jsonObject(with: initializationData, options: .allowFragments)
                resolver(["initializationData": initializationDataJson])
            } catch {
                rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
            }
        }
    }

    @objc
    public func listRequiredInputElementTypesForPaymentMethodType(
        _ paymentMethodTypeStr: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let rawDataManager = rawDataManager else {
            let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "The PrimerHeadlessUniversalCheckoutRawDataManager has not been initialized. Make sure you have called the PrimerHeadlessUniversalCheckoutRawDataManager.configure function first."])
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
            return
        }

        let inputElementTypes = rawDataManager.listRequiredInputElementTypes(for: rawDataManager.paymentMethodType).compactMap({ $0.stringValue })
        resolver(["inputElementTypes": inputElementTypes])
    }

    @objc
    public func setRawData(
        _ rawDataStr: String,
        resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let rawDataManager = rawDataManager else {
            let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "The PrimerHeadlessUniversalCheckoutRawDataManager has not been initialized. Make sure you have called the PrimerHeadlessUniversalCheckoutRawDataManager.configure function first."])
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
            return
        }

        if let rawCardData = PrimerCardData(cardDataStr: rawDataStr) {
            rawDataManager.rawData = rawCardData
            resolver(nil)
            return
        }

        if let rawPhoneNumberData = PrimerPhoneNumberData(phoneNumbeDatarStr: rawDataStr) {
            rawDataManager.rawData = rawPhoneNumberData
            resolver(nil)
            return
        }

        if let rawCardRedirectData = PrimerBancontactCardRedirectData(cardRedirectDataStr: rawDataStr) {
            rawDataManager.rawData = rawCardRedirectData
            resolver(nil)
            return
        }

        if let rawRetailerData = PrimerRawRetailerData(primerRawRetailerDataStr: rawDataStr) {
            rawDataManager.rawData = rawRetailerData
            resolver(nil)
            return
        }

        let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to decode RawData on iOS. Make sure you're providing a valid 'PrimerRawData' (or any inherited) object"])
        rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
    }

    @objc
    public func submit(
        _ resolver: RCTPromiseResolveBlock,
        rejecter: RCTPromiseRejectBlock
    ) {
        guard let rawDataManager = rawDataManager else {
            let err = NSError(domain: "native-bridge", code: 1, userInfo: [NSLocalizedDescriptionKey: "The PrimerHeadlessUniversalCheckoutRawDataManager has not been initialized. Make sure you have called the PrimerHeadlessUniversalCheckoutRawDataManager.configure function first."])
            rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
            return
        }

        rawDataManager.submit()
        resolver(nil)
    }
}

extension RNTPrimerHeadlessUniversalCheckoutRawDataManager: PrimerRawDataManagerDelegate {

    func primerRawDataManager(_ rawDataManager: PrimerHeadlessUniversalCheckout.RawDataManager, metadataDidChange metadata: [String : Any]?) {
        DispatchQueue.main.async {
            self.sendEvent(withName: PrimerHeadlessUniversalCheckoutRawDataManagerEvents.onMetadataChange.stringValue, body: metadata)
        }
    }

    func primerRawDataManager(_ rawDataManager: PrimerHeadlessUniversalCheckout.RawDataManager, dataIsValid isValid: Bool, errors: [Error]?) {
        DispatchQueue.main.async {
            var body: [String: Any] = ["isValid": isValid]
            if let errors = errors {
                let rnErrors = errors.compactMap({ $0.rnError })
                body["errors"] = rnErrors
            }
            self.sendEvent(withName: PrimerHeadlessUniversalCheckoutRawDataManagerEvents.onValidation.stringValue, body: body)
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
            print(body)
            self.sendEvent(withName: PrimerEvents.onError.stringValue, body: body)
        }
    }
}
