//
//  RNTRedirectManagerTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 23.5.24..
//

import XCTest
@testable import primer_io_react_native
import PrimerSDK

class RNTRedirectManagerTests: XCTestCase {

    var rnPrimerHeadlessUniversalCheckoutBanksComponent: RNTPrimerHeadlessUniversalCheckoutBanksComponent!

    override func setUp() {
        super.setUp()
        rnPrimerHeadlessUniversalCheckoutBanksComponent = RNTPrimerHeadlessUniversalCheckoutBanksComponent()
    }

    override func tearDown() {
        rnPrimerHeadlessUniversalCheckoutBanksComponent = nil
        super.tearDown()
    }

    // MARK: - Initialization & React Native Support

    func testInitialization() {
        XCTAssertNotNil(rnPrimerHeadlessUniversalCheckoutBanksComponent)
        XCTAssertTrue(RNTPrimerHeadlessUniversalCheckoutBanksComponent.requiresMainQueueSetup())
    }

    // MARK: - API

    func testCleanUp() {
        let expectation = self.expectation(description: "CleanUp completes")

        rnPrimerHeadlessUniversalCheckoutBanksComponent.cleanUp({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("CleanUp failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testStart() {
        let expectation = self.expectation(description: "Start completes")

        rnPrimerHeadlessUniversalCheckoutBanksComponent.start({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("Start failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testSubmit() {
        let expectation = self.expectation(description: "Submit completes")

        rnPrimerHeadlessUniversalCheckoutBanksComponent.submit({ _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("Submit failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testOnBankFilterChange() {
        let expectation = self.expectation(description: "OnBankFilterChange completes")

        rnPrimerHeadlessUniversalCheckoutBanksComponent.onBankFilterChange("dummy_filter_text", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("OnBankFilterChange failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }

    func testOnBankSelected() {
        let expectation = self.expectation(description: "OnBankSelected completes")

        rnPrimerHeadlessUniversalCheckoutBanksComponent.onBankSelected("dummy_bank_id", resolver: { _ in
            expectation.fulfill()
        }, rejecter: { _, _, _ in
            XCTFail("OnBankSelected failed")
        })

        waitForExpectations(timeout: 2.0, handler: nil)
    }
}
