//
//  ImplementedRNCallbacksTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 20.5.24..
//

import XCTest
@testable import primer_io_react_native

class ImplementedRNCallbacksTests: XCTestCase {

    func testDecodingWithAllFields() {
        let jsonString = """
        {
            "onAvailablePaymentMethodsLoad": true,
            "onTokenizationStart": true,
            "onTokenizationSuccess": true,
            "onCheckoutResume": true,
            "onCheckoutPending": true,
            "onCheckoutAdditionalInfo": true,
            "onError": true,
            "onCheckoutComplete": true,
            "onBeforeClientSessionUpdate": true,
            "onClientSessionUpdate": true,
            "onBeforePaymentCreate": true,
            "onPreparationStart": true,
            "onPaymentMethodShow": true,
            "onDismiss": true
        }
        """
        let jsonData = jsonString.data(using: .utf8)!
        let decoder = JSONDecoder()

        do {
            let callbacks = try decoder.decode(ImplementedRNCallbacks.self, from: jsonData)

            XCTAssertTrue(callbacks.isOnAvailablePaymentMethodsLoadImplemented)
            XCTAssertTrue(callbacks.isOnTokenizationStartImplemented)
            XCTAssertTrue(callbacks.isOnTokenizationSuccessImplemented)
            XCTAssertTrue(callbacks.isOnCheckoutResumeImplemented)
            XCTAssertTrue(callbacks.isOnCheckoutPendingImplemented)
            XCTAssertTrue(callbacks.isOnCheckoutAdditionalInfoImplemented)
            XCTAssertTrue(callbacks.isOnErrorImplemented)
            XCTAssertTrue(callbacks.isOnCheckoutCompleteImplemented)
            XCTAssertTrue(callbacks.isOnBeforeClientSessionUpdateImplemented)
            XCTAssertTrue(callbacks.isOnClientSessionUpdateImplemented)
            XCTAssertTrue(callbacks.isOnBeforePaymentCreateImplemented)
            XCTAssertTrue(callbacks.isOnPreparationStartImplemented)
            XCTAssertTrue(callbacks.isOnPaymentMethodShowImplemented)
            XCTAssertTrue(callbacks.isOnDismissImplemented)
        } catch {
            XCTFail("Decoding failed: \(error)")
        }
    }

    func testDecodingWithMissingFields() {
        let jsonString = """
        {
            "onTokenizationSuccess": true,
            "onCheckoutComplete": true,
            "onBeforeClientSessionUpdate": true
        }
        """
        let jsonData = jsonString.data(using: .utf8)!
        let decoder = JSONDecoder()

        do {
            let callbacks = try decoder.decode(ImplementedRNCallbacks.self, from: jsonData)

            XCTAssertFalse(callbacks.isOnAvailablePaymentMethodsLoadImplemented)
            XCTAssertFalse(callbacks.isOnTokenizationStartImplemented)
            XCTAssertTrue(callbacks.isOnTokenizationSuccessImplemented)
            XCTAssertFalse(callbacks.isOnCheckoutResumeImplemented)
            XCTAssertFalse(callbacks.isOnCheckoutPendingImplemented)
            XCTAssertFalse(callbacks.isOnCheckoutAdditionalInfoImplemented)
            XCTAssertFalse(callbacks.isOnErrorImplemented)
            XCTAssertTrue(callbacks.isOnCheckoutCompleteImplemented)
            XCTAssertTrue(callbacks.isOnBeforeClientSessionUpdateImplemented)
            XCTAssertFalse(callbacks.isOnClientSessionUpdateImplemented)
            XCTAssertFalse(callbacks.isOnBeforePaymentCreateImplemented)
            XCTAssertFalse(callbacks.isOnPreparationStartImplemented)
            XCTAssertFalse(callbacks.isOnPaymentMethodShowImplemented)
            XCTAssertFalse(callbacks.isOnDismissImplemented)
        } catch {
            XCTFail("Decoding failed: \(error)")
        }
    }

    func testDecodingWithEmptyJSON() {
        let jsonString = "{}"
        let jsonData = jsonString.data(using: .utf8)!
        let decoder = JSONDecoder()

        do {
            let callbacks = try decoder.decode(ImplementedRNCallbacks.self, from: jsonData)

            XCTAssertFalse(callbacks.isOnAvailablePaymentMethodsLoadImplemented)
            XCTAssertFalse(callbacks.isOnTokenizationStartImplemented)
            XCTAssertFalse(callbacks.isOnTokenizationSuccessImplemented)
            XCTAssertFalse(callbacks.isOnCheckoutResumeImplemented)
            XCTAssertFalse(callbacks.isOnCheckoutPendingImplemented)
            XCTAssertFalse(callbacks.isOnCheckoutAdditionalInfoImplemented)
            XCTAssertFalse(callbacks.isOnErrorImplemented)
            XCTAssertFalse(callbacks.isOnCheckoutCompleteImplemented)
            XCTAssertFalse(callbacks.isOnBeforeClientSessionUpdateImplemented)
            XCTAssertFalse(callbacks.isOnClientSessionUpdateImplemented)
            XCTAssertFalse(callbacks.isOnBeforePaymentCreateImplemented)
            XCTAssertFalse(callbacks.isOnPreparationStartImplemented)
            XCTAssertFalse(callbacks.isOnPaymentMethodShowImplemented)
            XCTAssertFalse(callbacks.isOnDismissImplemented)
        } catch {
            XCTFail("Decoding failed: \(error)")
        }
    }
}
