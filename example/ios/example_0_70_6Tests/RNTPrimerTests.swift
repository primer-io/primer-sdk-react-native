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
        let handlerExpectation = self.expectation(description: "HandleTokenizationNewClientToken handler executed")
        let resolverExpectation = self.expectation(description: "HandleTokenizationNewClientToken resolver executed")

        // Set the handler
        rnPrimer.primerDidTokenizePaymentMethodDecisionHandler = { newClientToken, _ in
            XCTAssertEqual(newClientToken, "newClientToken")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.handleTokenizationNewClientToken("newClientToken", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleTokenizationNewClientToken failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerDidTokenizePaymentMethodDecisionHandler)
    }

    func testHandleTokenizationSuccess() {
        let handlerExpectation = self.expectation(description: "HandleTokenizationSuccess handler executed")
        let resolverExpectation = self.expectation(description: "HandleTokenizationSuccess resolver executed")

        // Set the handler
        rnPrimer.primerDidTokenizePaymentMethodDecisionHandler = { newClientToken, _ in
            XCTAssertNil(newClientToken)
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.handleTokenizationSuccess({ _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleTokenizationSuccess failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerDidTokenizePaymentMethodDecisionHandler)
    }

    func testHandleTokenizationFailure() {
        let handlerExpectation = self.expectation(description: "HandleTokenizationFailure handler executed")
        let resolverExpectation = self.expectation(description: "HandleTokenizationFailure resolver executed")

        // Set the handler
        rnPrimer.primerDidTokenizePaymentMethodDecisionHandler = { _, errorMessage in
            XCTAssertEqual(errorMessage, "errorMessage")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.handleTokenizationFailure("errorMessage", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleTokenizationFailure failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerDidTokenizePaymentMethodDecisionHandler)
    }

    func testHandleResumeWithNewClientToken() {
        let handlerExpectation = self.expectation(description: "HandleResumeWithNewClientToken handler executed")
        let resolverExpectation = self.expectation(description: "HandleResumeWithNewClientToken resolver executed")

        // Set the handler
        rnPrimer.primerDidResumeWithDecisionHandler = { newClientToken, _ in
            XCTAssertEqual(newClientToken, "newClientToken")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.handleResumeWithNewClientToken("newClientToken", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleResumeWithNewClientToken failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerDidResumeWithDecisionHandler)
    }

    func testHandleResumeSuccess() {
        let handlerExpectation = self.expectation(description: "HandleResumeSuccess handler executed")
        let resolverExpectation = self.expectation(description: "HandleResumeSuccess resolver executed")

        // Set the handler
        rnPrimer.primerDidResumeWithDecisionHandler = { newClientToken, _ in
            XCTAssertNil(newClientToken)
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.handleResumeSuccess({ _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleResumeSuccess failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerDidResumeWithDecisionHandler)
    }

    func testHandleResumeFailure() {
        let handlerExpectation = self.expectation(description: "HandleResumeFailure handler executed")
        let resolverExpectation = self.expectation(description: "HandleResumeFailure resolver executed")

        // Set the handler
        rnPrimer.primerDidResumeWithDecisionHandler = { _, errorMessage in
            XCTAssertEqual(errorMessage, "errorMessage")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.handleResumeFailure("errorMessage", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandleResumeFailure failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerDidResumeWithDecisionHandler)
    }

    func testHandlePaymentCreationAbort() {
        let handlerExpectation = self.expectation(description: "HandlePaymentCreationAbort handler executed")
        let resolverExpectation = self.expectation(description: "HandlePaymentCreationAbort resolver executed")

        // Set the handler
        rnPrimer.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
            XCTAssertEqual(errorMessage, "errorMessage")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.handlePaymentCreationAbort("errorMessage", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandlePaymentCreationAbort failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerWillCreatePaymentWithDataDecisionHandler)
    }

    func testHandlePaymentCreationContinue() {
        let handlerExpectation = self.expectation(description: "HandlePaymentCreationContinue handler executed")
        let resolverExpectation = self.expectation(description: "HandlePaymentCreationContinue resolver executed")

        // Set the handler
        rnPrimer.primerWillCreatePaymentWithDataDecisionHandler = { errorMessage in
            XCTAssertNil(errorMessage)
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.handlePaymentCreationContinue({ _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("HandlePaymentCreationContinue failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerWillCreatePaymentWithDataDecisionHandler)
    }

    func testShowErrorMessage() {
        let handlerExpectation = self.expectation(description: "ShowErrorMessage handler executed")
        let resolverExpectation = self.expectation(description: "ShowErrorMessage resolver executed")

        // Set the handler
        rnPrimer.primerDidFailWithErrorDecisionHandler = { errorMessage in
            XCTAssertEqual(errorMessage, "errorMessage")
            handlerExpectation.fulfill()
        }

        // Call the method
        rnPrimer.showErrorMessage("errorMessage", resolver: { _ in
            resolverExpectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("ShowErrorMessage failed")
        })

        wait(for: [handlerExpectation, resolverExpectation], timeout: 2.0)
        XCTAssertNil(rnPrimer.primerDidFailWithErrorDecisionHandler)
    }
}
