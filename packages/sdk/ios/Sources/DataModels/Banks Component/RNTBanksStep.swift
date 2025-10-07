//
//  RNTBanksStep.swift
//  primer-io-react-native
//
//  Created by Stefan Vrancianu on 27.03.2024.
//

import Foundation
import PrimerSDK

protocol BanksStepRN {
    var stepName: String { get }
}

class LoadingRN: BanksStepRN, Encodable {
    var stepName: String = "banksLoading"
}

class BanksRetrievedRN: BanksStepRN, Encodable {
    var stepName: String = "banksRetrieved"
    var banks: [IssuingBank]

    init(banks: [IssuingBank]) {
        self.banks = banks
    }
}

extension BanksStep {
    func toLoadingRN() -> LoadingRN {
        return LoadingRN()
    }

    func toBanksRetrievedRN(banks: [IssuingBank]) -> BanksRetrievedRN {
        return BanksRetrievedRN(banks: banks)
    }
}
