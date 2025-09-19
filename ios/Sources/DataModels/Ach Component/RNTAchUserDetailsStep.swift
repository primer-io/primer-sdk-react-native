//
//  RNTAchUserDetailsStep.swift
//  Pods
//
//  Created by Flaviu Dunca on 12.06.2024.
//

import Foundation
import PrimerSDK

protocol AchUserDetailsStepRN {
    var stepName: String { get }
}

class UserDetailsCollectedRN: AchUserDetailsStepRN, Encodable {
    let stepName: String = "userDetailsCollected"
}

class UserDetailsRetrievedRN: AchUserDetailsStepRN, Encodable {
    let stepName: String = "userDetailsRetrieved"
    let firstName: String
    let lastName: String
    let emailAddress: String

    init(firstName: String, lastName: String, emailAddress: String) {
        self.firstName = firstName
        self.lastName = lastName
        self.emailAddress = emailAddress
    }
}

extension ACHUserDetailsStep {
    func toUserDetailsCollectedRN() -> UserDetailsCollectedRN {
        return UserDetailsCollectedRN()
    }

    func toUserDetailsRetrievedRN(firstName: String, lastName: String, emailAddress: String) -> UserDetailsRetrievedRN {
        return UserDetailsRetrievedRN(firstName: firstName, lastName: lastName, emailAddress: emailAddress)
    }
}
