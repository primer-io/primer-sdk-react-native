//
//  UIColorExtensionTests.swift
//  example_0_70_6Tests
//
//  Created by Niall Quinn on 16/05/24.
//

import XCTest
@testable import primer_io_react_native

final class UIColorExtensionTests: XCTestCase {

    func test_toHex() throws {
        // Tesddt case 1: RGB color without alpha
        let color1 = UIColor(red: 0, green: 0, blue: 0, alpha: 1.0)
        XCTAssertEqual(color1.toHex(), "000000")

        let color2 = UIColor(red: 1, green: 1, blue: 1, alpha: 1.0)
        XCTAssertEqual(color2.toHex(), "FFFFFF")

        let color3 = UIColor(red: 1, green: 0, blue: 0, alpha: 1.0)
        XCTAssertEqual(color3.toHex(), "FF0000")

        let color4 = UIColor(red: 0, green: 1, blue: 0, alpha: 1.0)
        XCTAssertEqual(color4.toHex(), "00FF00")

        let color5 = UIColor(red: 0, green: 0, blue: 1, alpha: 1.0)
        XCTAssertEqual(color5.toHex(), "0000FF")

        let noAlpha = UIColor(red: 0, green: 0, blue: 1, alpha: 1.0)
        XCTAssertEqual(noAlpha.toHex(alpha: true), "0000FFFF")

    }

}
