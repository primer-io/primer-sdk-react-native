//
//  PrimerThemeRN.swift
//  ReactNative
//
//  Created by Carl Eriksson on 10/08/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import PrimerSDK

struct PrimerThemeRN: Decodable {

}

extension PrimerThemeRN {
    func asPrimerTheme() -> PrimerTheme {
        return PrimerTheme()
    }
}
