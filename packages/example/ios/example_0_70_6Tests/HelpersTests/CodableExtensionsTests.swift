//
//  CodableExtensionsTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 17.5.24..
//

import XCTest
@testable import primer_io_react_native

// Define test structs conforming to Encodable and Decodable for testing purposes
private struct TestStruct: Codable, Equatable {
    let id: Int
    let name: String
}

// Unit test class for the extensions
class CodableExtensionsTests: XCTestCase {

    func testEncodableToJsonObject() {
        let testObject = TestStruct(id: 1, name: "Test")

        do {
            let jsonObject = try testObject.toJsonObject()
            XCTAssertNotNil(jsonObject)
            if let jsonDict = jsonObject as? [String: Any] {
                XCTAssertEqual(jsonDict["id"] as? Int, 1)
                XCTAssertEqual(jsonDict["name"] as? String, "Test")
            } else {
                XCTFail("Encoded object is not a valid JSON dictionary")
            }
        } catch {
            XCTFail("Encoding to JSON object failed with error: \(error)")
        }
    }

    func testDecodableFromJsonString() {
        let jsonString = "{\"id\":1,\"name\":\"Test\"}"

        do {
            let testObject = try TestStruct.from(jsonString: jsonString)
            XCTAssertEqual(testObject, TestStruct(id: 1, name: "Test"))
        } catch {
            XCTFail("Decoding from JSON string failed with error: \(error)")
        }
    }

    func testDecodableFromInvalidJsonString() {
        let invalidJsonString = "{\"id\":1,\"name\":}"

        XCTAssertThrowsError(try TestStruct.from(jsonString: invalidJsonString)) { error in
            XCTAssertTrue(error is DecodingError)
        }
    }
}
