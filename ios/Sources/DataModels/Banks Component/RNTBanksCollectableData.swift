//
//  RNTBanksCollectableData.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 27.03.2024.
//

import Foundation
import PrimerSDK

protocol BanksCollectableDataRN {
    var validatableDataName: String { get }
}

class FilterRN: BanksCollectableDataRN, Encodable {
    var validatableDataName: String = "bankListFilter"
    var text: String

    init(text: String) {
        self.text = text
    }
}

class BankIdRN: BanksCollectableDataRN, Encodable {
    var validatableDataName: String = "bankId"
    var id: String

    init(id: String) {
        self.id = id
    }
}

extension BanksCollectableData {
    func toBankIdRN(bankId: String) -> BankIdRN {
        return BankIdRN(id: bankId)
    }

    func toFilterRN(text: String) -> FilterRN {
        return FilterRN(text: text)
    }
}
