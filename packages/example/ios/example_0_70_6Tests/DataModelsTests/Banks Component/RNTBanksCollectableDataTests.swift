//
//  RNTBanksCollectableDataTests.swift
//  example_0_70_6Tests
//
//  Created by Boris on 23.5.24..
//

import XCTest
@testable import primer_io_react_native
import PrimerSDK

class BanksCollectableDataRNTests: XCTestCase {

    func testFilterRNInitialization() {
        let filter = FilterRN(text: "filterText")
        XCTAssertEqual(filter.validatableDataName, "bankListFilter")
        XCTAssertEqual(filter.text, "filterText")
    }

    func testBankIdRNInitialization() {
        let bankId = BankIdRN(id: "bankId123")
        XCTAssertEqual(bankId.validatableDataName, "bankId")
        XCTAssertEqual(bankId.id, "bankId123")
    }

    func testBanksCollectableDataToBankIdRN() {
        let bankData = BanksCollectableData.bankId(bankId: "bankId123")
        let bankIdRN: BankIdRN?

        switch bankData {
        case .bankId(let bankId):
            bankIdRN = BankIdRN(id: bankId)
        default:
            bankIdRN = nil
        }

        if let bankIdRN = bankIdRN {
            XCTAssertEqual(bankIdRN.validatableDataName, "bankId")
            XCTAssertEqual(bankIdRN.id, "bankId123")
        } else {
            XCTFail("Conversion to BankIdRN failed")
        }
    }

    func testBanksCollectableDataToFilterRN() {
        let filterData = BanksCollectableData.bankFilterText(text: "filterText")
        let filterRN: FilterRN?

        switch filterData {
        case .bankFilterText(let text):
            filterRN = FilterRN(text: text)
        default:
            filterRN = nil
        }

        if let filterRN = filterRN {
            XCTAssertEqual(filterRN.validatableDataName, "bankListFilter")
            XCTAssertEqual(filterRN.text, "filterText")
        } else {
            XCTFail("Conversion to FilterRN failed")
        }
    }

    func testFilterRNEncoding() {
        let filter = FilterRN(text: "filterText")
        let encoder = JSONEncoder()
        do {
            let data = try encoder.encode(filter)
            let jsonString = String(data: data, encoding: .utf8)
            XCTAssertNotNil(jsonString)
        } catch {
            XCTFail("Encoding failed: \(error)")
        }
    }

    func testBankIdRNEncoding() {
        let bankId = BankIdRN(id: "bankId123")
        let encoder = JSONEncoder()
        do {
            let data = try encoder.encode(bankId)
            let jsonString = String(data: data, encoding: .utf8)
            XCTAssertNotNil(jsonString)
        } catch {
            XCTFail("Encoding failed: \(error)")
        }
    }

    func testBanksCollectableDataEncoding() {
        let bankIdData = BanksCollectableData.bankId(bankId: "bankId123")
        let filterData = BanksCollectableData.bankFilterText(text: "filterText")
        let encoder = JSONEncoder()

        do {
            let bankIdDataEncoded = try encoder.encode(bankIdData)
            let bankIdJsonString = String(data: bankIdDataEncoded, encoding: .utf8)
            XCTAssertNotNil(bankIdJsonString)

            let filterDataEncoded = try encoder.encode(filterData)
            let filterJsonString = String(data: filterDataEncoded, encoding: .utf8)
            XCTAssertNotNil(filterJsonString)
        } catch {
            XCTFail("Encoding failed: \(error)")
        }
    }
}
