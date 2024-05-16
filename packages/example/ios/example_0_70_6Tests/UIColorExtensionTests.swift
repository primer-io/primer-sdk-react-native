//
//  ErrorExtensionTests.swift
//  example_0_70_6Tests
//
//  Created by Niall Quinn on 16/05/24.
//

import XCTest
@testable import primer_io_react_native

final class ErrorExtensionTests: XCTestCase {

  func test_rnError() throws {
    // Test case 1: Error is PrimerValidationError
            let primerValidationError = PrimerV
            var errorDict = primerValidationError.rnError
            XCTAssertEqual(errorDict["errorId"], "123")
            XCTAssertEqual(errorDict["diagnosticsId"], "456")
            XCTAssertEqual(errorDict["description"], "Primer Validation Error")

            // Test case 2: Error is PrimerError
            let primerError = PrimerError(errorId: "789", diagnosticsId: "012", description: "Primer Error")
            errorDict = primerError.rnError
            XCTAssertEqual(errorDict["errorId"], "789")
            XCTAssertEqual(errorDict["diagnosticsId"], "012")
            XCTAssertEqual(errorDict["description"], "Primer Error")

            // Test case 3: Error is NSError
            let nsError = NSError(domain: "com.example.error", code: 404, userInfo: ["inputElementType": "textField"])
            errorDict = nsError.rnError
            XCTAssertEqual(errorDict["errorId"], "com.example.error")
            XCTAssertEqual(errorDict["inputElementType"], "textField")
  }

}
