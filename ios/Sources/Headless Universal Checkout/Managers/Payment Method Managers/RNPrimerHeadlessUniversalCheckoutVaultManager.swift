import PrimerSDK

@objc(RNPrimerHeadlessUniversalCheckoutVaultManager)
class RNPrimerHeadlessUniversalCheckoutVaultManager: RCTEventEmitter {

    private var vaultedManager: PrimerHeadlessUniversalCheckout.VaultManager!

    override func supportedEvents() -> [String]! {
        return []
    }

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc
    func configure(_ resolver : @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        do {
            self.vaultedManager = PrimerSDK.PrimerHeadlessUniversalCheckout.VaultManager()
            try self.vaultedManager.configure()
            resolver(nil)
        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }

    @objc
    func fetchVaultedPaymentMethods(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        self.vaultedManager.fetchVaultedPaymentMethods { vaultedPaymentMethods, err in
            if let err = err {
                rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
            } else if let paymentMethods = vaultedPaymentMethods {
                do {
                    let paymentMethodObjects = try paymentMethods.compactMap({ try $0.toJsonObject() })
                    resolver(["paymentMethods": paymentMethodObjects])
                } catch {
                    rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
                }
            }
        }
    }
    
    @objc
    func deleteVaultedPaymentMethod(_ vaultedPaymentMethodId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        self.vaultedManager.deleteVaultedPaymentMethod(id: vaultedPaymentMethodId) { err in
            if let err = err {
                rejecter(err.rnError["errorId"]!, err.rnError["description"], err)
            } else {
                resolver([])
            }
        }
    }
    
    @objc
    func validate(_ vaultedPaymentMethodId: String, additionalDataStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        do {
            let additionalData = try PrimerVaultedCardAdditionalData.from(jsonString: additionalDataStr)
            self.vaultedManager.validate(vaultedPaymentMethodId: vaultedPaymentMethodId, vaultedPaymentMethodAdditionalData: additionalData) { err in
                if let err = err, err.count > 0 {
                    rejecter(err.first!.rnError["errorId"]!, err.first!.rnError["description"], err.first!)
                } else {
                    resolver(["validationErrors": []])
                }
            }
        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }
    
    @objc
    func startPaymentFlow(_ vaultedPaymentMethodId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        self.vaultedManager.startPaymentFlow(vaultedPaymentMethodId: vaultedPaymentMethodId)
    }
    
    @objc
    func startPaymentFlowWithAdditionalData(_ vaultedPaymentMethodId: String, additionalDataStr: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        do {
            let additionalData = try PrimerVaultedCardAdditionalData.from(jsonString: additionalDataStr)
            self.vaultedManager.startPaymentFlow(vaultedPaymentMethodId: vaultedPaymentMethodId,
                                                 vaultedPaymentMethodAdditionalData: additionalData)
        } catch {
            rejecter(error.rnError["errorId"]!, error.rnError["description"], error)
        }
    }
}
