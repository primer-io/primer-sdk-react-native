//
//  PrimerRawRetailerData+ExtensionTests.swift
//  ExampleTests
//
//  Created by Boris on 20.5.24..
//

import XCTest
import PrimerSDK
@testable import primer_io_react_native

class PrimerRawRetailerDataTests: XCTestCase {

    func testConvenienceInitWithValidJSON() {
        let jsonString = """
        {
            "id": "retailer123"
        }
        """

        guard let retailerData = PrimerRetailerData(primerRetailerDataStr: jsonString) else {
            return XCTFail("Initialization should succeed with valid JSON")
        }

        XCTAssertEqual(retailerData.id, "retailer123")
    }

    func testConvenienceInitWithMissingId() {
        let jsonString = """
        {
            "anotherField": "value"
        }
        """

        let retailerData = PrimerRetailerData(primerRetailerDataStr: jsonString)
        XCTAssertNil(retailerData, "Initialization should fail if id field is missing")
    }

    func testConvenienceInitWithEmptyJSON() {
        let jsonString = "{}"

        let retailerData = PrimerRetailerData(primerRetailerDataStr: jsonString)
        XCTAssertNil(retailerData, "Initialization should fail with empty JSON")
    }

    func testConvenienceInitWithInvalidJSON() {
        let jsonString = """
        {
            "id": 123
        }
        """

        let retailerData = PrimerRetailerData(primerRetailerDataStr: jsonString)
        XCTAssertNil(retailerData, "Initialization should fail with invalid JSON format")
    }

    func testConvenienceInitWithNonJSONString() {
        let nonJSONString = "This is not a JSON string"

        let retailerData = PrimerRetailerData(primerRetailerDataStr: nonJSONString)
        XCTAssertNil(retailerData, "Initialization should fail with non-JSON string")
    }
}
