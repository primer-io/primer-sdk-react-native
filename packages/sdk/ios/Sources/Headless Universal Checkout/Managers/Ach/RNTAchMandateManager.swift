//
//  RNTAchMandateManager.swift
//  primer-io-react-native
//
//  Created by Flaviu Dunca on 18.06.2024.
//

import Foundation
import React
import PrimerSDK

@objc(RNTAchMandateManager)
class RNTAchMandateManager: NSObject, RCTBridgeModule {
    private let errorMessage = "Mandate delegate is not defined"

    static func moduleName() -> String! {
        return "RNTAchMandateManager"
    }

    func methodQueue() -> DispatchQueue {
        return DispatchQueue.main
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }

    static var mandateDelegate: ACHMandateDelegate?

    @objc
    func acceptMandate(
        _ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock
    ) {
        if let delegate = RNTAchMandateManager.mandateDelegate {
            delegate.acceptMandate()
            resolver(nil)
        } else {
            rejecter("native-ios", errorMessage, nil)
        }
    }

    @objc
    func declineMandate(
        _ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock
    ) {
        if let delegate = RNTAchMandateManager.mandateDelegate {
            delegate.declineMandate()
            resolver(nil)
        } else {
            rejecter("native-ios", errorMessage, nil)
        }
    }
}
