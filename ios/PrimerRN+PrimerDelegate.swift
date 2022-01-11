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
    
    func onTokenizeSuccess(
        _ paymentMethodToken: PaymentMethodToken,
        resumeHandler: ResumeHandlerProtocol
    ) {
        do {
            let json = try encoder.encode(paymentMethodToken)
            let data = String(data: json, encoding: .utf8)!
            self.onTokenizeSuccessCallback?([data])
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
        onResumeFlowCallback = { error, clientToken in
            if let error = error {
                resumeHandler.handle(error: error)
            } else if let clientToken = clientToken {
                resumeHandler.handle(newClientToken: clientToken)
            } else {
                resumeHandler.handleSuccess()
            }
        }
    }
    
    func onClientSessionActions(_ actions: [ClientSession.Action], resumeHandler: ResumeHandlerProtocol?) {
        do {
            let actionsRN: [[String: Any]] = actions.compactMap  {
                
                if ($0.`type` == "SELECT_PAYMENT_METHOD") {
                    let network = ($0.params?["binData"] as? [String: Any])?["network"] as? String
                    return [
                        "type": "SET_PAYMENT_METHOD",
                        "paymentMethodType": $0.params?["paymentMethodType"] as? String,
                        "network": network,
                    ]
                }
                    
                if ($0.`type` == "UNSELECT_PAYMENT_METHOD") {
                    return [
                        "type": "UNSET_PAYMENT_METHOD",
                    ]
                }
                
                if ($0.`type` == "SET_BILLING_ADDRESS") {
                    
                    var billingAddress: [String: String] = [:]
                    
                    $0.params?.forEach { entry in
                        if let value = entry.value as? String, !value.isEmpty {
                            billingAddress[entry.key] = value
                        }
                    }
                    
                    return [
                        "type": "SET_BILLING_ADDRESS",
                        "params": [ "billingAddress": billingAddress ]
                    ]
                }
                
                return [ "type": "UNKNOWN" ]
            }
            
            let request: [String: Any] = [
                "actions": actionsRN
            ]
            
            let data = try JSONSerialization.data(withJSONObject: request, options: .fragmentsAllowed)
            let jsonString = String(data: data, encoding: .utf8)!
            self.onClientSessionActionsCallback?([jsonString])
        } catch {
            checkoutFailed(with: ErrorTypeRN.ParseJsonFailed)
        }
        
        onActionResumeCallback = { error, token in
            if let token = token {
                resumeHandler?.handle(newClientToken: token)
            } else if let error = error {
                resumeHandler?.handle(error: error)
            } else {
                resumeHandler?.handle(error: ErrorTypeRN.generic)
            }
        }
    }
    
    func onResumeSuccess(_ clientToken: String, resumeHandler: ResumeHandlerProtocol) {
        self.onResumeSuccessCallback?([clientToken])
        
        onResumeFlowCallback = { error, clientToken in
            if let error = error {
                resumeHandler.handle(error: error)
            } else if let clientToken = clientToken {
                resumeHandler.handle(newClientToken: clientToken)
            } else {
                resumeHandler.handleSuccess()
            }
        }
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
