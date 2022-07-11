//
//  NativeHeadlessCheckoutCardComponentsManager.swift
//  primer-io-react-native
//
//  Created by Evangelos on 21/6/22.
//

import Foundation
import PrimerSDK

extension PrimerInputElementType {
    var stringValue: String {
        switch self {
        case .cardNumber:
            return "cardNumber"
        case .expiryDate:
            return "expiryDate"
        case .cvv:
            return "cvv"
        case .cardholderName:
            return "cardholderName"
        case .otp:
            return "otp"
        case .postalCode:
            return "postalCode"
        case .unknown:
            return "unknown"
        }
    }
}

@objc
enum PrimerHeadlessUniversalCheckoutCardFormManagerEvents: Int, CaseIterable {
    
    case onCardFormIsValidValueChange = 0
    
    var stringValue: String {
        switch self {
        case .onCardFormIsValidValueChange:
            return "onCardFormIsValidValueChange"
        }
    }
}

@objc(NativeHeadlessCheckoutCardComponentsManager)
class NativeHeadlessCheckoutCardComponentsManager: RCTEventEmitter {
    
    var headlessUniversalCheckoutCardComponentsUIManager: PrimerHeadlessUniversalCheckout.CardFormUIManager?
    var inputElements: [PrimerInputElement]?
    
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override init() {
        super.init()
        headlessUniversalCheckoutCardComponentsUIManager = try! PrimerHeadlessUniversalCheckout.CardFormUIManager()
    }
    
    override func supportedEvents() -> [String]! {
        return PrimerHeadlessUniversalCheckoutCardFormManagerEvents.allCases.compactMap({ $0.stringValue })
    }
    
    // MARK: - API
    
    @objc
    public func listRequiredInputElementTypes(_ resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        let requiredInputElementTypesStrArr = (headlessUniversalCheckoutCardComponentsUIManager?.requiredInputElementTypes ?? []).compactMap({ $0.stringValue })
        resolver(["requiredInputElementTypes": requiredInputElementTypesStrArr])
    }
    
    @objc
    func setInputElementsWithTags(_ tags: [NSNumber]) {
        guard let rctUIManager = self.bridge.module(for: RCTUIManager.self) as? RCTUIManager else {
            return
        }
        
        rctUIManager.methodQueue.async {
            self.inputElements = []
            
            for tag in tags {
                DispatchQueue.main.async {
                    if let view = rctUIManager.view(forReactTag: tag) {
                        if let rntCardNumberInputElement = view as? RNTCardNumberInputElement {
                            self.inputElements!.append(rntCardNumberInputElement)
                        } else if let rntExpiryDateInputElement = view as? RNTExpiryDateInputElement {
                            self.inputElements!.append(rntExpiryDateInputElement)
                        } else if let rntCVVInputElement = view as? RNTCVVInputElement {
                            self.inputElements!.append(rntCVVInputElement)
                        } else if let rntCardHolderInputElement = view as? RNTCardHolderInputElement {
                            self.inputElements!.append(rntCardHolderInputElement)
                        }
                        
                        if self.inputElements!.count == tags.count {
                            // Set the input elements
                            self.headlessUniversalCheckoutCardComponentsUIManager?.inputElements = self.inputElements!
                            
                            // But override its elements' delegates
                            for inputElement in self.inputElements! {
                                inputElement.inputElementDelegate = self
                            }
                        }
                        
                    } else {
                        print("Failure")
                    }
                }
            }
        }
    }
    
    @objc
    func tokenize() {
        headlessUniversalCheckoutCardComponentsUIManager!.tokenize()
    }
}

extension NativeHeadlessCheckoutCardComponentsManager: PrimerInputElementDelegate {
    
    func inputElementDidFocus(_ sender: PrimerInputElement) {
        if let primerCardNumberInputElement = sender as? RNTCardNumberInputElement {
            primerCardNumberInputElement.onFocus?(nil)
        } else if let primerExpiryDateInputElement = sender as? RNTExpiryDateInputElement {
            primerExpiryDateInputElement.onFocus?(nil)
        } else if let primerCVVInputElement = sender as? RNTCVVInputElement {
            primerCVVInputElement.onFocus?(nil)
        } else if let primerCardHolderNameInputElement = sender as? RNTCardHolderInputElement {
            primerCardHolderNameInputElement.onFocus?(nil)
        }
    }
    
    func inputElementDidBlur(_ sender: PrimerInputElement) {
        if let primerCardNumberInputElement = sender as? RNTCardNumberInputElement {
            primerCardNumberInputElement.onBlur?(nil)
        } else if let primerExpiryDateInputElement = sender as? RNTExpiryDateInputElement {
            primerExpiryDateInputElement.onBlur?(nil)
        } else if let primerCVVInputElement = sender as? RNTCVVInputElement {
            primerCVVInputElement.onBlur?(nil)
        } else if let primerCardHolderNameInputElement = sender as? RNTCardHolderInputElement {
            primerCardHolderNameInputElement.onBlur?(nil)
        }
    }
    
    func inputElementValueDidChange(_ sender: PrimerInputElement) {
        if let primerCardNumberInputElement = sender as? RNTCardNumberInputElement {
            primerCardNumberInputElement.onValueChange?(nil)
        } else if let primerExpiryDateInputElement = sender as? RNTExpiryDateInputElement {
            primerExpiryDateInputElement.onValueChange?(nil)
        } else if let primerCVVInputElement = sender as? RNTCVVInputElement {
            primerCVVInputElement.onValueChange?(nil)
        } else if let primerCardHolderNameInputElement = sender as? RNTCardHolderInputElement {
            primerCardHolderNameInputElement.onValueChange?(nil)
        }
    }
    
    func inputElementValueIsValid(_ sender: PrimerInputElement, isValid: Bool) {
        if let primerCardNumberInputElement = sender as? RNTCardNumberInputElement {
            primerCardNumberInputElement.onValueIsValid?(["isValid": isValid])
        } else if let primerExpiryDateInputElement = sender as? RNTExpiryDateInputElement {
            primerExpiryDateInputElement.onValueIsValid?(["isValid": isValid])
        } else if let primerCVVInputElement = sender as? RNTCVVInputElement {
            primerCVVInputElement.onValueIsValid?(["isValid": isValid])
        } else if let primerCardHolderNameInputElement = sender as? RNTCardHolderInputElement {
            primerCardHolderNameInputElement.onValueIsValid?(["isValid": isValid])
        }
        
        guard let inputElements = self.inputElements else { return }
        
        var isCardFormValid = false
        
        if isValid {
            let otherInputTextFields = inputElements.compactMap({ $0 as? PrimerInputTextField }).filter({ $0 != (sender as? PrimerInputTextField) })
            if otherInputTextFields.allSatisfy({ $0.isValid }) {
                isCardFormValid = true
            }
        }
        
        sendEvent(withName: PrimerHeadlessUniversalCheckoutCardFormManagerEvents.onCardFormIsValidValueChange.stringValue, body: ["isCardFormValid": isCardFormValid])
    }
    
    func inputElementDidDetectType(_ sender: PrimerInputElement, type: Any?) {
        if let primerCardNumberInputElement = sender as? RNTCardNumberInputElement {
            if let cardNetworkType = type as? CardNetwork {
                primerCardNumberInputElement.onValueTypeDetect?(["type": cardNetworkType.rawValue])
            } else if let typeStr = type as? String {
                primerCardNumberInputElement.onValueTypeDetect?(["type": typeStr])
            }
        }
    }
}

extension NativeHeadlessCheckoutCardComponentsManager: PrimerCardFormDelegate {
    
    func cardFormUIManager(_ cardFormUIManager: PrimerHeadlessUniversalCheckout.CardFormUIManager, isCardFormValid: Bool) {
        
    }
}
