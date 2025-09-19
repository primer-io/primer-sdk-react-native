//
//  PrimerPhoneNumberData+ExtensionTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 20.5.24..
//

import PrimerSDK
import XCTest
@testable import primer_io_react_native

class PrimerPhoneNumberDataTests: XCTestCase {

    func testConvenienceInitWithValidJSON() {
        let jsonString = """
        {
            "phoneNumber": "+1234567890"
        }
        """

        guard let phoneNumberData = PrimerPhoneNumberData(phoneNumbeDatarStr: jsonString) else {
            return XCTFail("Initialization should succeed with valid JSON")
        }

        XCTAssertEqual(phoneNumberData.phoneNumber, "+1234567890")
    }

    func testConvenienceInitWithMissingPhoneNumber() {
        let jsonString = """
        {
            "anotherField": "value"
        }
        """

        let phoneNumberData = PrimerPhoneNumberData(phoneNumbeDatarStr: jsonString)
        XCTAssertNil(phoneNumberData, "Initialization should fail if phoneNumber field is missing")
    }

    func testConvenienceInitWithEmptyJSON() {
        let jsonString = "{}"

        let phoneNumberData = PrimerPhoneNumberData(phoneNumbeDatarStr: jsonString)
        XCTAssertNil(phoneNumberData, "Initialization should fail with empty JSON")
    }

    func testConvenienceInitWithInvalidJSON() {
        let jsonString = """
        {
            "phoneNumber": 1234567890
        }
        """

        let phoneNumberData = PrimerPhoneNumberData(phoneNumbeDatarStr: jsonString)
        XCTAssertNil(phoneNumberData, "Initialization should fail with invalid JSON format")
    }

    func testConvenienceInitWithNonJSONString() {
        let nonJSONString = "This is not a JSON string"

        let phoneNumberData = PrimerPhoneNumberData(phoneNumbeDatarStr: nonJSONString)
        XCTAssertNil(phoneNumberData, "Initialization should fail with non-JSON string")
    }
}
