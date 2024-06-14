//
//  RNTAchUserDetailsCollectableData.swift
//  Pods
//
//  Created by Flaviu Dunca on 12.06.2024.
//

import Foundation
import PrimerSDK

protocol AchUserDetailsCollectableDataRN {
    var validatableDataName: String { get }
}

class FirstNameRN: AchUserDetailsCollectableDataRN, Encodable {
    let validatableDataName: String = "firstName"
    let value: String

    init(value: String) {
        self.value = value
    }
}

class LastNameRN: AchUserDetailsCollectableDataRN, Encodable {
    let validatableDataName: String = "lastName"
    let value: String

    init(value: String) {
        self.value = value
    }
}

class EmailAddressRN: AchUserDetailsCollectableDataRN, Encodable {
    let validatableDataName: String = "emailAddress"
    let value: String

    init(value: String) {
        self.value = value
    }
}

extension ACHUserDetailsCollectableData {
    func toFirstNameRN(value: String) -> FirstNameRN {
        return FirstNameRN(value: value)
    }
    
    func toLastNameRN(value: String) -> LastNameRN {
        return LastNameRN(value: value)
    }
    
    func toEmailAddressRN(value: String) -> EmailAddressRN {
        return EmailAddressRN(value: value)
    }
}
