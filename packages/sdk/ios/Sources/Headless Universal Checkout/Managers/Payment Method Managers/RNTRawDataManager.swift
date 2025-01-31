//
//  RNTPrimerHeadlessUniversalCheckoutRawDataManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 3/8/22.
//

import Foundation
import PrimerSDK

// swiftlint:disable type_name
@objc
enum PrimerHeadlessUniversalCheckoutRawDataManagerEvents: Int, CaseIterable {
  // swiftlint:enable type_name

  case onMetadataChange = 0
  case onValidation

  var stringValue: String {
    switch self {
    case .onMetadataChange:
      return "onMetadataChange"
    case .onValidation:
      return "onValidation"
    }
  }
}

// swiftlint:disable type_name
@objc(RNTPrimerHeadlessUniversalCheckoutRawDataManager)
class RNTPrimerHeadlessUniversalCheckoutRawDataManager: RCTEventEmitter {
  // swiftlint:enable type_name

  private var rawDataManager: PrimerHeadlessUniversalCheckout.RawDataManager!
  private var paymentMethodType: String?

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func supportedEvents() -> [String]! {
    return PrimerHeadlessUniversalCheckoutRawDataManagerEvents.allCases.compactMap({
      $0.stringValue
    })
  }

  // MARK: - API

  @objc
  public func configure(
    _ paymentMethodTypeStr: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    self.paymentMethodType = paymentMethodTypeStr

    do {
      self.rawDataManager = try PrimerHeadlessUniversalCheckout.RawDataManager(
        paymentMethodType: self.paymentMethodType!, delegate: self)
    } catch {
      rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
    }

    self.rawDataManager!.configure { data, error in
      do {
        guard error == nil else {
          rejecter(error!.rnError["errorId"]!, error!.rnError["description"], error)
          return
        }
        let initializationData = try JSONEncoder().encode(data)
        let initializationDataJson = try JSONSerialization.jsonObject(
          with: initializationData, options: .allowFragments)
        resolver(["initializationData": initializationDataJson])
      } catch {
        rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
      }
    }
  }

  @objc
  public func listRequiredInputElementTypes(
    _ resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    guard let rawDataManager = rawDataManager else {
      let err = RNTNativeError(
        errorId: "native-ios",
        errorDescription: "The RawDataManager has not been initialized",
        recoverySuggestion: "Make sure you have called initialized the `RawDataManager' first.")
      rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
      return
    }

    let inputElementTypes = rawDataManager.listRequiredInputElementTypes(
      for: rawDataManager.paymentMethodType
    ).compactMap({ $0.stringValue })
    resolver(["inputElementTypes": inputElementTypes])
  }

  @objc
  public func setRawData(
    _ rawDataStr: String,
    resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    guard let rawDataManager = rawDataManager else {
      let err = RNTNativeError(
        errorId: "native-ios",
        errorDescription: "The RawDataManager has not been initialized",
        recoverySuggestion: "Make sure you have called initialized the `RawDataManager' first.")
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

    if let rawCardRedirectData = PrimerBancontactCardData(bankcontactCardDataStr: rawDataStr) {
      rawDataManager.rawData = rawCardRedirectData
      resolver(nil)
      return
    }

    if let rawRetailerData = PrimerRetailerData(primerRetailerDataStr: rawDataStr) {
      rawDataManager.rawData = rawRetailerData
      resolver(nil)
      return
    }

    let err = RNTNativeError(
      errorId: "native-ios",
      errorDescription: "Failed to decode RawData on iOS.",
      recoverySuggestion: "Make sure you're providing a valid 'RawData' (or any inherited) object.")
    rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
  }

  @objc
  public func submit(
    _ resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    guard let rawDataManager = rawDataManager else {
      let err = RNTNativeError(
        errorId: "native-ios",
        errorDescription: "The RawDataManager has not been initialized",
        recoverySuggestion: "Make sure you have called initialized the `RawDataManager' first.")
      rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
      return
    }

    rawDataManager.submit()
    resolver(nil)
  }

  @objc
  public func cleanUp(
    _ resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {

  }

}

extension RNTPrimerHeadlessUniversalCheckoutRawDataManager:
  PrimerHeadlessUniversalCheckoutRawDataManagerDelegate {

  func primerRawDataManager(
    _ rawDataManager: PrimerHeadlessUniversalCheckout.RawDataManager,
    metadataDidChange metadata: [String: Any]?
  ) {
    DispatchQueue.main.async {
      self.sendEvent(
        withName: PrimerHeadlessUniversalCheckoutRawDataManagerEvents.onMetadataChange.stringValue,
        body: metadata)
    }
  }

  func primerRawDataManager(
    _ rawDataManager: PrimerHeadlessUniversalCheckout.RawDataManager, dataIsValid isValid: Bool,
    errors: [Error]?
  ) {
    DispatchQueue.main.async {
      var body: [String: Any] = ["isValid": isValid]
      if let errors = errors {
        let rnErrors = errors.compactMap({ $0.rnError })
        body["errors"] = rnErrors
      }
      self.sendEvent(
        withName: PrimerHeadlessUniversalCheckoutRawDataManagerEvents.onValidation.stringValue,
        body: body)
    }
  }

  private func handleRNBridgeError(
    _ error: Error, checkoutData: PrimerCheckoutData?, stopOnDebug: Bool
  ) {
    DispatchQueue.main.async {
      if stopOnDebug {
        assertionFailure(error.localizedDescription)
      }

      var body: [String: Any] = ["error": error.rnError]
      if let checkoutData = checkoutData,
        let data = try? JSONEncoder().encode(checkoutData),
        let json = try? JSONSerialization.jsonObject(with: data) {
        body["checkoutData"] = json
      }
      print(body)
      self.sendEvent(withName: PrimerEvents.onError.stringValue, body: body)
    }
  }
}
