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
    var intent: PrimerIntentRN?
    var onTokenizeSuccessCallback: RCTResponseSenderBlock?
    var onClientSessionActionsCallback: RCTResponseSenderBlock?
    var onResumeSuccessCallback: RCTResponseSenderBlock?
    var onVaultSuccessCallback: RCTResponseSenderBlock?
    var onDismissCallback: RCTResponseSenderBlock?
    var onPrimerErrorCallback: RCTResponseSenderBlock?
    var onResumeFlowCallback: BasicCompletionBlock?
    var onActionResumeCallback: BasicCompletionBlock?
    
    private var sdkWasInitialised = false
    internal var haltExecution = false
    
    @objc func configureSettings(_ settingsStr: String) {
        do {
            let settingsData = settingsStr.data(using: .utf8)!
            let settingsRN = try JSONDecoder().decode(PrimerSettingsRN.self, from: settingsData)
            self.settings = settingsRN
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
    }

    @objc func configureTheme(_ themeStr: String) {
        do {
            let themeData = themeStr.data(using: .utf8)!
            let themeRN = try JSONDecoder().decode(PrimerThemeRN.self, from: themeData)
            self.theme = themeRN
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
    }
    
    @objc func configureIntent(_ intentStr: String) {
        do {
            let intentData = intentStr.data(using: .utf8)!
            let intentRN = try JSONDecoder().decode(PrimerIntentRN.self, from: intentData)
            self.intent = intentRN
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
    
    @objc func initialize(_ token: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                guard let viewController = RCTPresentedViewController() else {
                    throw ErrorTypeRN.noIosViewController
                }

                guard let intent = self?.intent else {
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
                
                DispatchQueue.main.async {
                    if (intent.vault) {
                        Primer.shared.showVaultManager(on: viewController, clientToken: token)
                    } else {
                        Primer.shared.showUniversalCheckout(on: viewController, clientToken: token)
                    }
                }
                
            } catch {
                self?.checkoutFailed(with: error)
            }
        }
    }
    
    @objc func resume(_ resumeRequestStr: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                let resumeRequestData = resumeRequestStr.data(using: .utf8)!
                let resumeRequest = try JSONDecoder().decode(PrimerResumeRequest.self, from: resumeRequestData)
                
                if let errorDescription = resumeRequest.error {
                    let errorRN = NativeError(errorId: "server-error", errorDescription: errorDescription, recoverySuggestion: nil)
                    self?.onResumeFlowCallback?(errorRN, nil)
                } else if let clientToken = resumeRequest.token {
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
    
    @objc func actionResume(_ resumeRequestStr: String) -> Void {
        DispatchQueue.main.async { [weak self] in
            do {
                let resumeRequestData = resumeRequestStr.data(using: .utf8)!
                let resumeRequestRN = try JSONDecoder().decode(PrimerResumeRequest.self, from: resumeRequestData)
                
                if let errorDescription = resumeRequestRN.error {
                    let errorRN = NativeError(errorId: "server-error", errorDescription: errorDescription, recoverySuggestion: nil)
                    self?.onActionResumeCallback?(errorRN, nil)
                } else if let clientToken = resumeRequestRN.token {
                    self?.onActionResumeCallback?(nil, clientToken)
                } else {
                    self?.onActionResumeCallback?(nil, self?.clientToken)
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
