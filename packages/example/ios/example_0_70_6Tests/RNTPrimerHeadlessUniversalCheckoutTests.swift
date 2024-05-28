//
//  RNTPrimerHeadlessUniversalCheckoutTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 23.5.24..
//

import XCTest
@testable import primer_io_react_native
import PrimerSDK

class RNTPrimerHeadlessUniversalCheckoutTests: XCTestCase {

    var rnPrimerHeadlessUniversalCheckout: RNTPrimerHeadlessUniversalCheckout!

    override func setUp() {
        super.setUp()
        rnPrimerHeadlessUniversalCheckout = RNTPrimerHeadlessUniversalCheckout()
    }

    override func tearDown() {
        rnPrimerHeadlessUniversalCheckout = nil
        super.tearDown()
    }

    // MARK: - Initialization & React Native Support

    func testInitialization() {
        XCTAssertNotNil(rnPrimerHeadlessUniversalCheckout)
        XCTAssertTrue(RNTPrimerHeadlessUniversalCheckout.requiresMainQueueSetup())
    }

    // MARK: - API

    func testCleanUp() {
        let expectation = self.expectation(description: "CleanUp completes")

        rnPrimerHeadlessUniversalCheckout.cleanUp({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("CleanUp failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    // MARK: - Decision Handlers

    func testHandleTokenizationNewClientToken() {
        let expectation = self.expectation(description: "HandleTokenizationNewClientToken completes")

        rnPrimerHeadlessUniversalCheckout.handleTokenizationNewClientToken("newClientToken", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleTokenizationNewClientToken failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandleResumeWithNewClientToken() {
        let expectation = self.expectation(description: "HandleResumeWithNewClientToken completes")

        rnPrimerHeadlessUniversalCheckout.handleResumeWithNewClientToken("newClientToken", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleResumeWithNewClientToken failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandleCompleteFlow() {
        let expectation = self.expectation(description: "HandleCompleteFlow completes")

        rnPrimerHeadlessUniversalCheckout.handleCompleteFlow({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleCompleteFlow failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandlePaymentCreationAbort() {
        let expectation = self.expectation(description: "HandlePaymentCreationAbort completes")

        rnPrimerHeadlessUniversalCheckout.handlePaymentCreationAbort("errorMessage", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandlePaymentCreationAbort failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandlePaymentCreationContinue() {
        let expectation = self.expectation(description: "HandlePaymentCreationContinue completes")

        rnPrimerHeadlessUniversalCheckout.handlePaymentCreationContinue({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandlePaymentCreationContinue failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }
}
