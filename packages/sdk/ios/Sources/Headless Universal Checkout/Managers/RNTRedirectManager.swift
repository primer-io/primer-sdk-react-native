//
//  RNTRedirectManager.swift
//  example_0_70_6
//
//  Created by Faisal Iqbal on 15.12.2023.
//

import Foundation
import PrimerSDK

@objc
enum RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents: Int, CaseIterable {
  
  case onRetrieved = 0
  case onRetrieving=1
  case onError=2
  case onValid=3
  case onInvalid=4
  case onValidating
  
  var stringValue: String {
    switch self {
    case .onRetrieved:
      return "onRetrieved"
    case .onRetrieving:
      return "onRetrieving"
    case .onError:
      return "onError"
    case .onValid:
      return "onValid"
    case .onInvalid:
      return "onInvalid"
    case .onValidating:
      return "onValidating"
    }
  }
}
  
  
  @objc(RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager)
  class RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager: RCTEventEmitter {
    
    private var redirectManager: PrimerHeadlessUniversalCheckout.ComponentWithRedirectManager!
    var banksComponent: (any BanksComponent)?

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    override init() {
      super.init()
    }
    
      override func supportedEvents() -> [String] {
      return RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.allCases.compactMap({ $0.stringValue })
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
        
        if #available(iOS 13.0, *) {
          guard let banksComponent: any BanksComponent = try? redirectManager.provide(paymentMethodType: paymentMethodTypeStr) else {
            let err = RNTNativeError(
                                errorId: "native-ios",
                                errorDescription: "Failed to find asset of \(paymentMethodTypeStr) for this session",
                                recoverySuggestion: nil)
                            throw err
          }

          banksComponent.start()
          self.banksComponent = banksComponent

        } else {
            guard let banksComponent: any BanksComponent = try? redirectManager.provideBanksComponent(paymentMethodType: paymentMethodTypeStr) as? any BanksComponent else {
              let err = RNTNativeError(
                                  errorId: "native-ios",
                                  errorDescription: "Failed to find asset of \(paymentMethodTypeStr) for this session",
                                  recoverySuggestion: nil)
                              throw err
            }

            banksComponent.start()
            self.banksComponent = banksComponent
        }
        
        banksComponent?.stepDelegate = self
        banksComponent?.validationDelegate = self
        banksComponent?.errorDelegate = self
        
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
      banksComponent?.updateCollectedData(collectableData: BanksCollectableData.bankFilterText(text: filterText))
      resolver(nil)
    }
    
    @objc
    public func onBankSelected(
      _ bankId: String,
      resolver: RCTPromiseResolveBlock,
      rejecter: RCTPromiseRejectBlock
    ) {
      banksComponent?.updateCollectedData(collectableData: BanksCollectableData.bankId(bankId: bankId))
      resolver(nil)
    }
  }

  extension RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager: PrimerHeadlessSteppableDelegate {
    func didReceiveStep(step: PrimerSDK.PrimerHeadlessStep) {
      guard let step = step as? BanksStep else { return }
      switch step {
      // Handle bank list loading being in progress (e.g. show loading indicator)
      case .loading:
          self.sendEvent(
                       withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onRetrieving.stringValue,
                       body: ["retrieving": true])
        break
      // Display list of banks
      case .banksRetrieved(banks: let banks):
        guard var data = try? JSONEncoder().encode(banks) else { return  }
                      var json = try? JSONSerialization.jsonObject(with: data)
        
          self.sendEvent(
            withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onRetrieved.stringValue,
            body: ["banks": json])
        break
      }
    }
  }
extension RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager: PrimerHeadlessValidatableDelegate {
    func didUpdate(validationStatus: PrimerSDK.PrimerValidationStatus, for data: PrimerSDK.PrimerCollectableData?) {
        guard let data = data as? BanksCollectableData else { return }
        
        let eventName: String
        switch validationStatus {
        case .valid:
            eventName = RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onValid.stringValue
        case .validating:
            eventName = RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onValidating.stringValue
        case .invalid(let errors):
            let jsonErrors = try? errors.toJsonObject()
            self.sendEvent(
                withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onInvalid.stringValue,
                body: ["errors": jsonErrors])
            return
        case .error(let error):
            let nsError = NSError(domain: error.errorId, code: -1, userInfo: error.errorUserInfo)
            self.sendEvent(
                withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onError.stringValue,
                body: ["errors": error])
            return
        }
        
        switch data {
        case .bankId(let bankId):
            sendEventData(eventName, body: ["id": "\(bankId)"])
        case .bankFilterText(let text):
            sendEventData(eventName, body: ["text": "\(text)"])
        }
    }
    
    private func sendEventData<T: Encodable>(_ eventName: String, body: T) {
        let jsonBody = try? body.toJsonObject()
        self.sendEvent(withName: eventName, body: ["data": jsonBody])
    }
}

extension RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager: PrimerHeadlessErrorableDelegate {
    func didReceiveError(error: PrimerSDK.PrimerError) {
        let error = NSError(domain: error.errorId, code: -1, userInfo: error.errorUserInfo)
        
        self.sendEvent(
            withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onError.stringValue,
            body: ["errors": error])
    }
}
