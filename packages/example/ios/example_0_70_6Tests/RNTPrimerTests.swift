//
//  RNTPrimerTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 20.5.24..
//

import XCTest
import PrimerSDK
@testable import primer_io_react_native

class RNTPrimerTests: XCTestCase {

    var rnPrimer: RNTPrimer!

    override func setUp() {
        super.setUp()
        rnPrimer = RNTPrimer()
    }

    override func tearDown() {
        rnPrimer = nil
        super.tearDown()
    }

    // MARK: - INITIALIZATION & REACT NATIVE SUPPORT

    func testInitialization() {
        XCTAssertNotNil(rnPrimer)
        XCTAssertTrue(RNTPrimer.requiresMainQueueSetup())
    }

    func testSupportedEvents() {
        let expectedEvents = PrimerEvents.allCases.map { $0.stringValue }
        XCTAssertEqual(rnPrimer.supportedEvents(), expectedEvents)
    }

    // MARK: - SDK API

    func testConfigure() {
        let expectation = self.expectation(description: "Configure completes")

        rnPrimer.configure("{\"setting\":\"value\"}", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("Configure failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testDismiss() {
        rnPrimer.dismiss()
        // No specific assertion as dismiss method doesn't return a value
    }

    func testCleanUp() {
        rnPrimer.cleanUp()
        // No specific assertion as cleanUp method doesn't return a value
    }

    // MARK: - DECISION HANDLERS

    func testHandleTokenizationNewClientToken() {
        let expectation = self.expectation(description: "HandleTokenizationNewClientToken completes")

        rnPrimer.handleTokenizationNewClientToken("newClientToken", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleTokenizationNewClientToken failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandleTokenizationSuccess() {
        let expectation = self.expectation(description: "HandleTokenizationSuccess completes")

        rnPrimer.handleTokenizationSuccess({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleTokenizationSuccess failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandleTokenizationFailure() {
        let expectation = self.expectation(description: "HandleTokenizationFailure completes")

        rnPrimer.handleTokenizationFailure("errorMessage", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleTokenizationFailure failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandleResumeWithNewClientToken() {
        let expectation = self.expectation(description: "HandleResumeWithNewClientToken completes")

        rnPrimer.handleResumeWithNewClientToken("newClientToken", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleResumeWithNewClientToken failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandleResumeSuccess() {
        let expectation = self.expectation(description: "HandleResumeSuccess completes")

        rnPrimer.handleResumeSuccess({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleResumeSuccess failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandleResumeFailure() {
        let expectation = self.expectation(description: "HandleResumeFailure completes")

        rnPrimer.handleResumeFailure("errorMessage", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleResumeFailure failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandlePaymentCreationAbort() {
        let expectation = self.expectation(description: "HandlePaymentCreationAbort completes")

        rnPrimer.handlePaymentCreationAbort("errorMessage", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandlePaymentCreationAbort failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testHandlePaymentCreationContinue() {
        let expectation = self.expectation(description: "HandlePaymentCreationContinue completes")

        rnPrimer.handlePaymentCreationContinue({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandlePaymentCreationContinue failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testShowErrorMessage() {
        let expectation = self.expectation(description: "ShowErrorMessage completes")

        rnPrimer.showErrorMessage("errorMessage", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("ShowErrorMessage failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }
}
