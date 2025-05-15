//
//  UIImageExtensionTests.swift
//  ExampleTests
//
//  Created by Boris on 17.5.24..
//

import XCTest
import UIKit
@testable import primer_io_react_native

class UIImageExtensionTests: XCTestCase {

    func testStoreImageSuccessfully() {
        // Create a dummy image
        let image = UIImage(systemName: "circle.fill")!
        let imageName = "testImage"

        do {
            let url = try image.store(withName: imageName)

            // Check if the file was created
            XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))

            // Clean up
            try FileManager.default.removeItem(at: url)
        } catch {
            XCTFail("Image storing failed with error: \(error)")
        }
    }
}
