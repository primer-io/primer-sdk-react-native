//
//  ErrorExtensionTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 17.5.24..
//

import XCTest
import PrimerSDK
@testable import primer_io_react_native

class ErrorExtensionTests: XCTestCase {

  func testRNErrorForPrimerValidationError() {
    let error = PrimerValidationError.invalidCardnumber(message: "Invalid card number", userInfo: ["key": "value"], diagnosticsId: "12345")

    let expected: [String: String] = [
      "description": "[invalid-card-number] Invalid card number",
      "errorId": "invalid-card-number",
      "diagnosticsId": "12345",
      "inputElementType": "CARD_NUMBER"
    ]

    XCTAssertEqual(error.rnError, expected)
  }

  func testRNErrorForPrimerError() {
    let error = PrimerError.generic(message: "message", userInfo: ["test1": "test2"], diagnosticsId: "diagnosticsId123")

    let expected: [String: String] = [
      "errorId": "primer-generic",
      "diagnosticsId": "diagnosticsId123",
      "description": "[primer-generic] Generic error | Message: message | Data: {\n  \"test1\" : \"test2\"\n}) (diagnosticsId: diagnosticsId123)"
    ]
    XCTAssertEqual(error.rnError, expected)
  }

  func testRNErrorForNSError() {
    let userInfo: [String: Any] = [
      NSLocalizedDescriptionKey: "An error occurred",
      "inputElementType": "TEXT_FIELD",
      NSLocalizedRecoverySuggestionErrorKey: "Try again"
    ]
    let error = NSError(domain: "com.example.error", code: 1001, userInfo: userInfo)

    let expected: [String: String] = [
      "description": "An error occurred",
      "errorId": "com.example.error",
      "inputElementType": "TEXT_FIELD",
      "recoverySuggestion": "Try again"
    ]

    XCTAssertEqual(error.rnError, expected)
  }

  func testRNErrorForNSErrorWithoutRecoverySuggestion() {
    let userInfo: [String: Any] = [
      NSLocalizedDescriptionKey: "Another error occurred",
      "inputElementType": "BUTTON"
    ]
    let error = NSError(domain: "com.example.anotherError", code: 1002, userInfo: userInfo)

    let expected: [String: String] = [
      "description": "Another error occurred",
      "errorId": "com.example.anotherError",
      "inputElementType": "BUTTON"
    ]

    XCTAssertEqual(error.rnError, expected)
  }
}
