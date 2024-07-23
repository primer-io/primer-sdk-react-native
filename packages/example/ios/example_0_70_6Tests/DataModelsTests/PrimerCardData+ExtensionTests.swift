//
//  PrimerCardData+ExtensionTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 20.5.24..
//

import XCTest
import PrimerSDK
@testable import primer_io_react_native

class PrimerCardDataTests: XCTestCase {

    func testConvenienceInitWithValidJSON() {
        let jsonString = """
        {
            "cardNumber": "1234567812345678",
            "cvv": "123",
            "expiryDate": "12/24",
            "cardholderName": "John Doe"
        }
        """

        guard let cardData = PrimerCardData(cardDataStr: jsonString) else {
            return XCTFail("Initialization should succeed with valid JSON")
        }

        XCTAssertEqual(cardData.cardNumber, "1234567812345678")
        XCTAssertEqual(cardData.cvv, "123")
        XCTAssertEqual(cardData.expiryDate, "12/24")
        XCTAssertEqual(cardData.cardholderName, "John Doe")
    }

    func testConvenienceInitWithMissingFields() {
        let jsonString = """
        {
            "cardNumber": "1234567812345678",
            "cvv": "123"
        }
        """

        let cardData = PrimerCardData(cardDataStr: jsonString)
        XCTAssertNil(cardData, "Initialization should fail if any required field is missing")
    }

    func testConvenienceInitWithEmptyJSON() {
        let jsonString = "{}"

        let cardData = PrimerCardData(cardDataStr: jsonString)
        XCTAssertNil(cardData, "Initialization should fail with empty JSON")
    }

    func testConvenienceInitWithInvalidJSON() {
        let jsonString = """
        {
            "cardNumber": 1234567812345678,
            "cvv": 123,
            "expiryDate": 12/24
        }
        """

        let cardData = PrimerCardData(cardDataStr: jsonString)
        XCTAssertNil(cardData, "Initialization should fail with invalid JSON format")
    }

    func testConvenienceInitWithNonJSONString() {
        let nonJSONString = "This is not a JSON string"

        let cardData = PrimerCardData(cardDataStr: nonJSONString)
        XCTAssertNil(cardData, "Initialization should fail with non-JSON string")
    }
}
