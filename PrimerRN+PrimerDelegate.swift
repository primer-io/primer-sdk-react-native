//
//  PrimerRN+PrimerDelegate.swift
//  primer-io-react-native
//
//  Created by Carl Eriksson on 22/09/2021.
//
import PrimerSDK

extension PrimerRN: PrimerDelegate {

    func clientTokenCallback(_ completion: @escaping (String?, Error?) -> Void) {
        guard let clientToken = clientToken else {
            checkoutFailed(with: ErrorTypeRN.clientTokenNotConfigured)
            completion(nil, ErrorTypeRN.clientTokenNotConfigured)
            return
        }
        completion(clientToken, nil)
    }
    
    func onTokenizeSuccess(_ paymentMethodToken: PaymentMethodToken, _ completion: @escaping (Error?) -> Void) {
        do {
            let json = try encoder.encode(paymentMethodToken)
            let data = String(data: json, encoding: .utf8)!
            self.onTokenizeSuccessCallback?([data])
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
        onResumeFlowCallback = completion
    }
    
    func tokenAddedToVault(_ token: PaymentMethodToken) {
        do {
            let json = try encoder.encode(token)
            let data = String(data: json, encoding: .utf8)!
            self.onVaultSuccessCallback?([data])
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
    }
    
    func onCheckoutDismissed() {
        self.onDismissCallback?([])
        self.onDismissCallback = nil
    }
    
    func checkoutFailed(with error: Error) {
        do {
            if let error = error as? ErrorTypeRN {
                let exception = PrimerErrorRN(exceptionType: error, description: nil)
                let json = try encoder.encode(exception)
                let data = String(data: json, encoding: .utf8)!
                self.onPrimerErrorCallback?([data])
            } else {
                self.onPrimerErrorCallback?(["{\"exceptionType\":\"CheckoutFlowFailed\"}"])
            }
        } catch {
            self.onPrimerErrorCallback?(["{\"exceptionType\":\"ParseJsonFailed\"}"])
        }
        haltExecution = true
    }
}