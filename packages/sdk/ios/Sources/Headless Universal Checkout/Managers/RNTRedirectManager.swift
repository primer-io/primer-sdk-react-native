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
    
    override func supportedEvents() -> [String]! {
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
          banksComponent = try! redirectManager.provideBanksComponent(paymentMethodType: paymentMethodTypeStr) as! any BanksComponent
       
          banksComponent?.start()
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
      
    }
    
    @objc
    public func onBankFilterChange(
      _ filterText: String,
      resolver: RCTPromiseResolveBlock,
      rejecter: RCTPromiseRejectBlock
    ) {
      banksComponent!.updateCollectedData(collectableData: BanksCollectableData.bankFilterText(text: filterText))
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
      switch validationStatus {
      case .valid:
        self.sendEvent(
          withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onValid.stringValue,
                     body: ["validating": false])
        break
      case .validating:
        self.sendEvent(
                     withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onValidating.stringValue,
                     body: ["validating": true])
        break
      case .invalid(errors: let errors):
        self.sendEvent(
                  withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onInvalid.stringValue,
                  body: ["errors": errors])
        
      case .error(error: let error):
        self.sendEvent(
                     withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onError.stringValue,
                     body: ["errors": [error]])
      }
    }
  }
  
  
extension RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager: PrimerHeadlessErrorableDelegate {
  func didReceiveError(error: PrimerSDK.PrimerError) {

    self.sendEvent(
      withName: RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManagerEvents.onError.stringValue,
                 body: ["errors": [error]])
  }
}
