//
//  ImplementedRNCallbacks.swift
//  primer-io-react-native
//
//  Created by Evangelos on 20/5/22.
//

import Foundation

internal struct ImplementedRNCallbacks: Codable {
    
    public var isPrimerDidCompleteCheckoutWithDataImplemented: Bool = false
    public var isPrimerWillCreatePaymentWithDataImplemented: Bool = false
    public var isPrimerClientSessionWillUpdateImplemented: Bool = false
    public var isPrimerClientSessionDidUpdateImplemented: Bool = false
    public var isPrimerDidTokenizePaymentMethodImplemented: Bool = false
    public var isPrimerDidResumeWithImplemented: Bool = false
    public var isPrimerDidDismissImplemented: Bool = false
    public var isPrimerDidFailWithErrorImplemented: Bool = false
    
    enum CodingKeys: String, CodingKey {
        case isPrimerDidCompleteCheckoutWithDataImplemented = "primerDidCompleteCheckoutWithData"
        case isPrimerWillCreatePaymentWithDataImplemented = "primerWillCreatePaymentWithData"
        case isPrimerClientSessionWillUpdateImplemented = "primerClientSessionWillUpdate"
        case isPrimerClientSessionDidUpdateImplemented = "primerClientSessionDidUpdate"
        case isPrimerDidTokenizePaymentMethodImplemented = "primerDidTokenizePaymentMethod"
        case isPrimerDidResumeWithImplemented = "primerDidResumeWith"
        case isPrimerDidDismissImplemented = "primerDidDismiss"
        case isPrimerDidFailWithErrorImplemented = "primerDidFailWithError"
    }
}
