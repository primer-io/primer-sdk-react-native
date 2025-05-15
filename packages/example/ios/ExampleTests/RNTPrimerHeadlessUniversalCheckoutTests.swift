//
//  RNTPrimerHeadlessUniversalCheckoutTests.swift
//  ExampleTests
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
        let handlerExpectation = self.expectation(description: "HandleTokenizationNewClientToken handler executed")
        let resolverExpectation = self.expectation(description: "HandleTokenizationNewClientToken resolver executed")

        // Set the handler
        rnPrimerHeadlessUniversalCheckout.primerDidTokenizePaymentMethodDecisionHandler = { newClientToken, _ in
            XCTAssertEqual(newClientToken, "newClientToken")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimerHeadlessUniversalCheckout.handleTokenizationNewClientToken("newClientToken", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleTokenizationNewClientToken failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimerHeadlessUniversalCheckout.primerDidTokenizePaymentMethodDecisionHandler)
    }

    func testHandleResumeWithNewClientToken() {
        let handlerExpectation = self.expectation(description: "HandleResumeWithNewClientToken handler executed")
        let resolverExpectation = self.expectation(description: "HandleResumeWithNewClientToken resolver executed")

        // Set the handler
        rnPrimerHeadlessUniversalCheckout.primerDidResumeWithDecisionHandler = { newClientToken, _ in
            XCTAssertEqual(newClientToken, "newClientToken")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimerHeadlessUniversalCheckout.handleResumeWithNewClientToken("newClientToken", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleResumeWithNewClientToken failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimerHeadlessUniversalCheckout.primerDidResumeWithDecisionHandler)
    }

    func testHandleCompleteFlow() {
        let handlerExpectation = self.expectation(description: "HandleCompleteFlow handler executed")
        let resolverExpectation = self.expectation(description: "HandleCompleteFlow resolver executed")

        // Set the handler
        rnPrimerHeadlessUniversalCheckout.primerDidResumeWithDecisionHandler = { newClientToken, _ in
            XCTAssertNil(newClientToken)
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimerHeadlessUniversalCheckout.handleCompleteFlow({ _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleCompleteFlow failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimerHeadlessUniversalCheckout.primerDidResumeWithDecisionHandler)
    }

    func testHandlePaymentCreationAbort() {
        let handlerExpectation = self.expectation(description: "HandlePaymentCreationAbort handler executed")
        let resolverExpectation = self.expectation(description: "HandlePaymentCreationAbort resolver executed")

        // Set the handler
        rnPrimerHeadlessUniversalCheckout.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
            XCTAssertEqual(errorMessage, "errorMessage")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimerHeadlessUniversalCheckout.handlePaymentCreationAbort("errorMessage", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandlePaymentCreationAbort failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimerHeadlessUniversalCheckout.primerWillCreatePaymentWithDataDecisionHandler)
    }

    func testHandlePaymentCreationContinue() {
        let handlerExpectation = self.expectation(description: "HandlePaymentCreationContinue handler executed")
        let resolverExpectation = self.expectation(description: "HandlePaymentCreationContinue resolver executed")

        // Set the handler
        rnPrimerHeadlessUniversalCheckout.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
            XCTAssertNil(errorMessage)
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimerHeadlessUniversalCheckout.handlePaymentCreationContinue({ _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandlePaymentCreationContinue failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimerHeadlessUniversalCheckout.primerWillCreatePaymentWithDataDecisionHandler)
    }
}
