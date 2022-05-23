//
//  ImplementedRNCallbacks.swift
//  primer-io-react-native
//
//  Created by Evangelos on 20/5/22.
//

import Foundation

internal struct ImplementedRNCallbacks: Codable {
    
    public var isOnCheckoutCompleteImplemented: Bool = false
    public var isOnBeforeClientSessionUpdateImplemented: Bool = false
    public var isOnClientSessionUpdateImplemented: Bool = false
    public var isOnBeforePaymentCreateImplemented: Bool = false
    public var isOnCheckoutFailImplemented: Bool = false
    public var isOnDismissImplemented: Bool = false
    public var isOnTokenizeSuccessImplemented: Bool = false
    public var isOnResumeSuccessImplemented: Bool = false
    
    enum CodingKeys: String, CodingKey {
        case isOnCheckoutCompleteImplemented = "onCheckoutComplete"
        case isOnBeforeClientSessionUpdateImplemented = "onBeforeClientSessionUpdate"
        case isOnClientSessionUpdateImplemented = "onClientSessionUpdate"
        case isOnBeforePaymentCreateImplemented = "onBeforePaymentCreate"
        case isOnCheckoutFailImplemented = "onCheckoutFail"
        case isOnDismissImplemented = "onDismiss"
        case isOnTokenizeSuccessImplemented = "onTokenizeSuccess"
        case isOnResumeSuccessImplemented = "onResumeSuccess"
    }
}
