//
//  ImplementedRNCallbacks.swift
//  primer-io-react-native
//
//  Created by Evangelos on 20/5/22.
//

import Foundation

internal struct ImplementedRNCallbacks: Decodable {
    
    internal var isOnCheckoutCompleteImplemented: Bool = false
    internal var isOnBeforeClientSessionUpdateImplemented: Bool = false
    internal var isOnClientSessionUpdateImplemented: Bool = false
    internal var isOnBeforePaymentCreateImplemented: Bool = false
    internal var isOnErrorImplemented: Bool = false
    internal var isOnDismissImplemented: Bool = false
    internal var isOnTokenizeSuccessImplemented: Bool = false
    internal var isOnResumeSuccessImplemented: Bool = false
    internal var isOnHUCTokenizeStartImplemented: Bool = false
    internal var isOnHUCPrepareStartImplemented: Bool = false
    internal var isOnHUCClientSessionSetupImplemented: Bool = false
    internal var isOnHUCPaymentMethodPresentImplemented: Bool = false
    
    enum CodingKeys: String, CodingKey {
        case isOnCheckoutCompleteImplemented = "onCheckoutComplete"
        case isOnBeforeClientSessionUpdateImplemented = "onBeforeClientSessionUpdate"
        case isOnClientSessionUpdateImplemented = "onClientSessionUpdate"
        case isOnBeforePaymentCreateImplemented = "onBeforePaymentCreate"
        case isOnErrorImplemented = "onError"
        case isOnDismissImplemented = "onDismiss"
        case isOnTokenizeSuccessImplemented = "onTokenizeSuccess"
        case isOnResumeSuccessImplemented = "onResumeSuccess"
        case isOnHUCTokenizeStartImplemented = "onHUCTokenizeStart"
        case isOnHUCPrepareStartImplemented = "onHUCPrepareStart"
        case isOnHUCClientSessionSetupImplemented = "onHUCClientSessionSetup"
        case isOnHUCPaymentMethodPresentImplemented = "onHUCPaymentMethodPresent"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        self.isOnCheckoutCompleteImplemented = (try? container.decode(Bool?.self, forKey: .isOnCheckoutCompleteImplemented)) ?? false
        self.isOnBeforeClientSessionUpdateImplemented = (try? container.decode(Bool?.self, forKey: .isOnBeforeClientSessionUpdateImplemented)) ?? false
        self.isOnClientSessionUpdateImplemented = (try? container.decode(Bool?.self, forKey: .isOnClientSessionUpdateImplemented)) ?? false
        self.isOnBeforePaymentCreateImplemented = (try? container.decode(Bool?.self, forKey: .isOnBeforePaymentCreateImplemented)) ?? false
        self.isOnErrorImplemented = (try? container.decode(Bool?.self, forKey: .isOnErrorImplemented)) ?? false
        self.isOnDismissImplemented = (try? container.decode(Bool?.self, forKey: .isOnDismissImplemented)) ?? false
        self.isOnTokenizeSuccessImplemented = (try? container.decode(Bool?.self, forKey: .isOnTokenizeSuccessImplemented)) ?? false
        self.isOnResumeSuccessImplemented = (try? container.decode(Bool?.self, forKey: .isOnResumeSuccessImplemented)) ?? false
        self.isOnHUCTokenizeStartImplemented = (try? container.decode(Bool?.self, forKey: .isOnHUCTokenizeStartImplemented)) ?? false
        self.isOnHUCPrepareStartImplemented = (try? container.decode(Bool?.self, forKey: .isOnHUCPrepareStartImplemented)) ?? false
        self.isOnHUCClientSessionSetupImplemented = (try? container.decode(Bool?.self, forKey: .isOnHUCClientSessionSetupImplemented)) ?? false
        self.isOnHUCPaymentMethodPresentImplemented = (try? container.decode(Bool?.self, forKey: .isOnHUCPaymentMethodPresentImplemented)) ?? false
    }
}
