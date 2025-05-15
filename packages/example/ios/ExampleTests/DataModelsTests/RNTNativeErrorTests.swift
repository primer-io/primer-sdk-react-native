//
//  RNTNativeErrorTests.swift
//  ExampleTests
//
//  Created by Boris on 20.5.24..
//

import XCTest
@testable import primer_io_react_native

class RNTNativeErrorTests: XCTestCase {

    func testRnErrorWithRecoverySuggestion() {
        let error = RNTNativeError(errorId: "testId", errorDescription: "Test description", recoverySuggestion: "Try again")
        let expected = [
            "errorId": "testId",
            "description": "Test description",
            "recoverySuggestion": "Try again"
        ]
        XCTAssertEqual(error.rnError, expected)
    }

    func testRnErrorWithoutRecoverySuggestion() {
        let error = RNTNativeError(errorId: "testId", errorDescription: "Test description", recoverySuggestion: nil)
        let expected = [
            "errorId": "testId",
            "description": "Test description"
        ]
        XCTAssertEqual(error.rnError, expected)
    }

    func testRnErrorWithNilDescription() {
        let error = RNTNativeError(errorId: "testId", errorDescription: nil, recoverySuggestion: nil)
        let expected = [
            "errorId": "testId",
            "description": "Something went wrong"
        ]
        XCTAssertEqual(error.rnError, expected)
    }
}
