import UIKit
import PrimerSDK

typealias BasicCompletionBlock = ((Error?, String?) -> Void)

@objc(PrimerRN)
class PrimerRN: NSObject {
    
    let encoder = JSONEncoder()
    
    override init() {
        encoder.outputFormatting = .prettyPrinted
    }

    var clientToken: String?
    var settings: PrimerSettingsRN?
    var theme: PrimerThemeRN?
    var flow: PrimerSessionFlow?
    var onTokenizeSuccessCallback: RCTResponseSenderBlock?
    var onClientSessionActionsCallback: RCTResponseSenderBlock?
    var onResumeSuccessCallback: RCTResponseSenderBlock?
    var onVaultSuccessCallback: RCTResponseSenderBlock?
    var onDismissCallback: RCTResponseSenderBlock?
    var onPrimerErrorCallback: RCTResponseSenderBlock?
    var onResumeFlowCallback: BasicCompletionBlock?
    var onActionResumeCallback: BasicCompletionBlock?
    var onSavedPaymentInstrumentsFetchedCallback: RCTResponseSenderBlock?
    
    private var sdkWasInitialised = false
    internal var haltExecution = false
    
    @objc func configureSettings(_ request: String) {
        do {
            let json = request.data(using: .utf8)!
            let settings = try JSONDecoder().decode(PrimerSettingsRN.self, from: json)
            self.settings = settings
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
    }

    @objc func configureTheme(_ request: String) {
        do {
            let json = request.data(using: .utf8)!
            let themeRN = try JSONDecoder().decode(PrimerThemeRN.self, from: json)
            self.theme = themeRN
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
    }
    
    @objc func configureIntent(_ request: String) {
        do {
            let json = request.data(using: .utf8)!
            let intent = try JSONDecoder().decode(PrimerIntentRN.self, from: json)
            self.flow = intent.toPrimerSessionFlow()
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
    }
    
    @objc func configureOnTokenizeSuccess(_ callback: @escaping RCTResponseSenderBlock) {
        self.onTokenizeSuccessCallback = callback
    }
    
    @objc func configureOnClientSessionActions(_ callback: @escaping RCTResponseSenderBlock) {
        self.onClientSessionActionsCallback = callback
    }
    
    @objc func configureOnResumeSuccess(_ callback: @escaping RCTResponseSenderBlock) {
        self.onResumeSuccessCallback = callback
    }
    
    @objc func configureOnVaultSuccess(_ callback: @escaping RCTResponseSenderBlock) {
        self.onVaultSuccessCallback = callback
    }

    @objc func configureOnDismiss(_ callback: @escaping RCTResponseSenderBlock) {
        self.onDismissCallback = callback
    }

    @objc func configureOnPrimerError(_ callback: @escaping RCTResponseSenderBlock) {
        self.onPrimerErrorCallback = callback
    }
    
    @objc func configureOnSavedPaymentInstrumentsFetched(_ callback: @escaping RCTResponseSenderBlock) {
        self.onSavedPaymentInstrumentsFetchedCallback = callback
    }
    
    @objc func fetchSavedPaymentInstruments(_ token: String) {
        
        self.clientToken = token
        
        Primer.shared.delegate = self
        
        Primer.shared.fetchVaultedPaymentMethods { [weak self] result in
            switch result {
            case .failure(let error):
                self?.checkoutFailed(with: error)
            case .success(let tokens):
                do {
                    let json = try self?.encoder.encode(tokens)
                    let data = String(data: json!, encoding: .utf8)!
                    self?.onSavedPaymentInstrumentsFetchedCallback?([data])
                    self?.onSavedPaymentInstrumentsFetchedCallback = nil
                } catch {
                    self?.checkoutFailed(with: error)
                }
            }
        }
    }
    
    @objc func initialize(_ token: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                guard let viewController = RCTPresentedViewController() else {
                    throw ErrorTypeRN.noIosViewController
                }

                guard let flow = self?.flow else {
                    throw ErrorTypeRN.invalidPrimerIntent
                }
                
                guard
                    let settings = self?.settings?.asPrimerSettings(),
                    let theme = self?.theme?.asPrimerTheme()
                else {
                    throw ErrorTypeRN.settingsNotConfigured
                }
                
                self?.clientToken = token
                
                Primer.shared.delegate = self
                Primer.shared.configure(settings: settings, theme: theme)
                Primer.shared.showCheckout(viewController, flow: flow)
            } catch {
                self?.checkoutFailed(with: error)
            }
        }
    }
    
    @objc func resume(_ request: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                let json = request.data(using: .utf8)!
                let request = try JSONDecoder().decode(PrimerResumeRequest.self, from: json)
                
                if let error = request.error {
                    self?.onResumeFlowCallback?(ErrorRN(message: error), nil)
                } else if let clientToken = request.token {
                    self?.onResumeFlowCallback?(nil, clientToken)
                } else {
                    self?.onResumeFlowCallback?(nil, nil)
                }
                
                self?.onResumeFlowCallback = nil
            } catch {
                self?.checkoutFailed(with: error)
            }
        }
    }
    
    @objc func actionResume(_ request: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                let json = request.data(using: .utf8)!
                let request = try JSONDecoder().decode(PrimerResumeRequest.self, from: json)
                
                if let error = request.error {
                    self?.onActionResumeCallback?(ErrorRN(message: error), nil)
                } else if let clientToken = request.token {
                    self?.onActionResumeCallback?(nil, clientToken)
                } else {
                    self?.onActionResumeCallback?(nil, nil)
                }
                
                self?.onActionResumeCallback = nil
            } catch {
                self?.checkoutFailed(with: error)
            }
        }
    }
    
    @objc func dispose() -> Void {
        
    }
}
