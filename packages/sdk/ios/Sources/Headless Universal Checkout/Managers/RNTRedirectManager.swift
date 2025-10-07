//
//  RNTRedirectManager.swift
//  example_0_70_6
//
//  Created by Faisal Iqbal on 15.12.2023.
//

import Foundation
import PrimerSDK

// swiftlint:disable type_name
@objc(RNTPrimerHeadlessUniversalCheckoutBanksComponent)
class RNTPrimerHeadlessUniversalCheckoutBanksComponent: RCTEventEmitter {
  // swiftlint:enable type_name

  private var redirectManager: PrimerHeadlessUniversalCheckout.ComponentWithRedirectManager!
  var banksComponent: (any BanksComponent)?

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }

  override init() {
    super.init()
  }

  override func supportedEvents() -> [String] {
    return PrimerHeadlessUniversalCheckoutComponentEvent.allCases.compactMap({ $0.stringValue })
  }

  // MARK: - API

  @objc
  public func configure(
    _ paymentMethodTypeStr: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    print("configure")
    do {
      redirectManager = PrimerHeadlessUniversalCheckout.ComponentWithRedirectManager()

      guard
        let banksComponent: any BanksComponent =
          try? redirectManager.provide(paymentMethodType: paymentMethodTypeStr)
      else {
        let err = RNTNativeError(
          errorId: "native-ios",
          errorDescription: "Failed to find asset of \(paymentMethodTypeStr) for this session",
          recoverySuggestion: nil)
        throw err
      }

      self.banksComponent = banksComponent

      banksComponent.stepDelegate = self
      banksComponent.validationDelegate = self
      banksComponent.errorDelegate = self

      resolver(nil)

    } catch {
      rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
    }
  }

  @objc
  public func cleanUp(
    _ resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    self.banksComponent = nil
    resolver(nil)
  }

  @objc
  public func start(
    _ resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    banksComponent?.start()
    resolver(nil)
  }

  @objc
  public func submit(
    _ resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    banksComponent?.submit()
    resolver(nil)
  }

  @objc
  public func onBankFilterChange(
    _ filterText: String,
    resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    banksComponent?.updateCollectedData(
      collectableData: BanksCollectableData.bankFilterText(text: filterText))
    resolver(nil)
  }

  @objc
  public func onBankSelected(
    _ bankId: String,
    resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock
  ) {
    banksComponent?.updateCollectedData(
      collectableData: BanksCollectableData.bankId(bankId: bankId))
    resolver(nil)
  }
}

extension RNTPrimerHeadlessUniversalCheckoutBanksComponent: PrimerHeadlessSteppableDelegate {
  func didReceiveStep(step: PrimerSDK.PrimerHeadlessStep) {
    guard let step = step as? BanksStep else { return }
    switch step {
    case .loading:  // Handle bank list loading being in progress (e.g. show loading indicator)
      let rnLoading = try? step.toLoadingRN().toJsonObject()

      sendEvent(
        withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
        body: rnLoading
      )
    case .banksRetrieved(let banks):  // Display list of banks
      let rnBanks = try? step.toBanksRetrievedRN(banks: banks).toJsonObject()

      sendEvent(
        withName: PrimerHeadlessUniversalCheckoutComponentEvent.onStep.stringValue,
        body: rnBanks)
    }
  }
}

extension RNTPrimerHeadlessUniversalCheckoutBanksComponent: PrimerHeadlessValidatableDelegate {
  func didUpdate(
    validationStatus: PrimerSDK.PrimerValidationStatus, for data: PrimerSDK.PrimerCollectableData?
  ) {
    guard let data = data as? BanksCollectableData else { return }

    let eventName: String
    switch validationStatus {
    case .valid:
      eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValid.stringValue
    case .validating:
      eventName = PrimerHeadlessUniversalCheckoutComponentEvent.onValidating.stringValue
    case .invalid(let errors):
      let rnErrors = errors.map { $0.toPrimerValidationErrorRN() }
      let serializedData = try? ["errors": rnErrors].toJsonObject()

      self.sendEvent(
        withName: PrimerHeadlessUniversalCheckoutComponentEvent.onInvalid.stringValue,
        body: serializedData)
      return
    case .error(let error):
      let rnError = error.toPrimerErrorRN()
      let serializedData = try? ["errors": [rnError]].toJsonObject()

      self.sendEvent(
        withName: PrimerHeadlessUniversalCheckoutComponentEvent.onValidationError.stringValue,
        body: serializedData)
      return
    }

    var serializedData: Any?
    switch data {
    case .bankId(let bankId):
      let rnBankId = data.toBankIdRN(bankId: bankId)
      serializedData = try? ["data": rnBankId].toJsonObject()
    case .bankFilterText(let text):
      let rnText = data.toFilterRN(text: text)
      serializedData = try? ["data": rnText].toJsonObject()
    }

    sendEvent(withName: eventName, body: serializedData)
  }
}

extension RNTPrimerHeadlessUniversalCheckoutBanksComponent: PrimerHeadlessErrorableDelegate {
  func didReceiveError(error: PrimerSDK.PrimerError) {
    let rnError = error.toPrimerErrorRN()
    let serializedData = try? ["errors": [rnError]].toJsonObject()

    self.sendEvent(
      withName: PrimerHeadlessUniversalCheckoutComponentEvent.onError.stringValue,
      body: serializedData)
  }
}
