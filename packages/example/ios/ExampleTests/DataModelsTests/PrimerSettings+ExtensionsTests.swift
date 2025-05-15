//
//  PrimerSettings+ExtensionsTests.swift
//  ExampleTests
//
//  Created by Boris on 20.5.24..
//

import XCTest
@testable import primer_io_react_native
import PrimerSDK

class PrimerSettingsTests: XCTestCase {

    func testConvenienceInitWithMissingFields() {
        let jsonString = """
        {
            "paymentHandling": "AUTO"
        }
        """

        do {
            let settings = try PrimerSettings(settingsStr: jsonString)
            XCTAssertEqual(settings.paymentHandling, .auto)
        } catch {
            XCTFail("Initialization should succeed with missing optional fields")
        }
    }

    func testConvenienceInitWithEmptyJSON() {
        let jsonString = "{}"

        do {
            let settings = try PrimerSettings(settingsStr: jsonString)
            XCTAssertEqual(settings.paymentHandling, .auto)
        } catch {
            XCTFail("Initialization should succeed with empty JSON")
        }
    }

    func testConvenienceInitWithNonJSONString() {
        let nonJSONString = "This is not a JSON string"

        XCTAssertThrowsError(try PrimerSettings(settingsStr: nonJSONString), "Initialization should fail with non-JSON string")
    }
}
