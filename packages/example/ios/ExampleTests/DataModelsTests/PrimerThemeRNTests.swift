//
//  PrimerThemeRNTests.swift
//  ExampleTests
//
//  Created by Boris on 20.5.24..
//

import XCTest
@testable import primer_io_react_native
import PrimerSDK

class PrimerThemeRNTests: XCTestCase {

    func testAsPrimerTheme() {
        let jsonString = """
        {
            "colors": {
                "mainColor": {
                    "red": 255,
                    "green": 0,
                    "blue": 0,
                    "alpha": 255
                },
                "contrastingColor": {
                    "red": 0,
                    "green": 255,
                    "blue": 0,
                    "alpha": 255
                },
                "background": {
                    "red": 0,
                    "green": 0,
                    "blue": 255,
                    "alpha": 255
                },
                "text": {
                    "red": 0,
                    "green": 0,
                    "blue": 0,
                    "alpha": 255
                },
                "contrastingText": {
                    "red": 255,
                    "green": 255,
                    "blue": 255,
                    "alpha": 255
                },
                "borders": {
                    "red": 128,
                    "green": 128,
                    "blue": 128,
                    "alpha": 255
                },
                "disabled": {
                    "red": 192,
                    "green": 192,
                    "blue": 192,
                    "alpha": 255
                },
                "error": {
                    "red": 255,
                    "green": 0,
                    "blue": 0,
                    "alpha": 255
                }
            }
        }
        """

        guard let data = jsonString.data(using: .utf8) else {
            return XCTFail("Failed to convert JSON string to data")
        }

        do {
            let primerThemeRN = try JSONDecoder().decode(PrimerThemeRN.self, from: data)
            let primerTheme = primerThemeRN.asPrimerTheme()

            // Add assertions to verify the conversion to PrimerTheme
            XCTAssertNotNil(primerTheme)
        } catch {
            XCTFail("Decoding or conversion failed: \(error)")
        }
    }
}
