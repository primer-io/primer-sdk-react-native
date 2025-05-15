//
//  PrimerCheckoutPaymentMethodTypeTests.swift
//  ExampleTests
//
//  Created by Boris on 20.5.24..
//

import XCTest
import PrimerSDK
@testable import primer_io_react_native

class PrimerCheckoutPaymentMethodDataTests: XCTestCase {

    func testInitialization() {
        let paymentMethodType = PrimerCheckoutPaymentMethodType(type: "credit_card")
        let paymentMethodData = PrimerCheckoutPaymentMethodData(type: paymentMethodType)

        XCTAssertEqual(paymentMethodData.paymentMethodType.type, "credit_card")
    }

    func testToPrimerCheckoutPaymentMethodDataRN() {
        let paymentMethodType = PrimerCheckoutPaymentMethodType(type: "credit_card")
        let paymentMethodData = PrimerCheckoutPaymentMethodData(type: paymentMethodType)

        let paymentMethodDataRN = paymentMethodData.toPrimerCheckoutPaymentMethodDataRN()

        XCTAssertEqual(paymentMethodDataRN.paymentMethodType.type, "credit_card")
        XCTAssertEqual(paymentMethodDataRN.paymentMethod, "credit_card")
    }

    func testCodableConformance() {
        let paymentMethodType = PrimerCheckoutPaymentMethodType(type: "credit_card")
        let paymentMethodData = PrimerCheckoutPaymentMethodData(type: paymentMethodType)

        let encoder = JSONEncoder()
        let decoder = JSONDecoder()

        do {
            let data = try encoder.encode(paymentMethodData)
            let decodedPaymentMethodData = try decoder.decode(PrimerCheckoutPaymentMethodData.self, from: data)

            XCTAssertEqual(decodedPaymentMethodData.paymentMethodType.type, "credit_card")
        } catch {
            XCTFail("Encoding or decoding failed: \(error)")
        }
    }
}

class PrimerCheckoutPaymentMethodTypeTests: XCTestCase {

    func testInitialization() {
        let paymentMethodType = PrimerCheckoutPaymentMethodType(type: "credit_card")

        XCTAssertEqual(paymentMethodType.type, "credit_card")
    }

    func testCodableConformance() {
        let paymentMethodType = PrimerCheckoutPaymentMethodType(type: "credit_card")

        let encoder = JSONEncoder()
        let decoder = JSONDecoder()

        do {
            let data = try encoder.encode(paymentMethodType)
            let decodedPaymentMethodType = try decoder.decode(PrimerCheckoutPaymentMethodType.self, from: data)

            XCTAssertEqual(decodedPaymentMethodType.type, "credit_card")
        } catch {
            XCTFail("Encoding or decoding failed: \(error)")
        }
    }
}
