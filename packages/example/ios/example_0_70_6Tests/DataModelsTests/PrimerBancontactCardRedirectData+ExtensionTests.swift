//
//  PrimerBancontactCardRedirectData+ExtensionTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 20.5.24..
//

import XCTest
import PrimerSDK
@testable import primer_io_react_native

class PrimerBancontactCardRedirectData: XCTestCase {

    func testConvenienceInitWithValidJSON() {
        let jsonString = """
        {
            "cardNumber": "1234567812345678",
            "expiryDate": "12/24",
            "cardholderName": "John Doe"
        }
        """

        guard let cardData = PrimerBancontactCardData(bankcontactCardDataStr: jsonString) else {
            return XCTFail("Initialization should succeed with valid JSON")
        }

        XCTAssertEqual(cardData.cardNumber, "1234567812345678")
        XCTAssertEqual(cardData.expiryDate, "12/24")
        XCTAssertEqual(cardData.cardholderName, "John Doe")
    }

    func testConvenienceInitWithMissingFields() {
        let jsonString = """
        {
            "cardNumber": "1234567812345678",
            "expiryDate": "12/24"
        }
        """

        let cardData = PrimerBancontactCardData(bankcontactCardDataStr: jsonString)
        XCTAssertNil(cardData, "Initialization should fail if any required field is missing")
    }

    func testConvenienceInitWithEmptyJSON() {
        let jsonString = "{}"

        let cardData = PrimerBancontactCardData(bankcontactCardDataStr: jsonString)
        XCTAssertNil(cardData, "Initialization should fail with empty JSON")
    }

    func testConvenienceInitWithInvalidJSON() {
        let jsonString = """
        {
            "cardNumber": 1234567812345678,
            "expiryDate": 12/24,
            "cardholderName": "John Doe"
        }
        """

        let cardData = PrimerBancontactCardData(bankcontactCardDataStr: jsonString)
        XCTAssertNil(cardData, "Initialization should fail with invalid JSON format")
    }

    func testConvenienceInitWithNonJSONString() {
        let nonJSONString = "This is not a JSON string"

        let cardData = PrimerBancontactCardData(bankcontactCardDataStr: nonJSONString)
        XCTAssertNil(cardData, "Initialization should fail with non-JSON string")
    }
}
