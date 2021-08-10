//
//  PrimerExceptionRN.swift
//  ReactNative
//
//  Created by Carl Eriksson on 10/08/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

enum PrimerExceptionRN: String, Error {
    case noViewController
    case invalidPrimerIntent
    case themeParsingFailed
    case settingsParsingFailed
    case tokenParsingFailed
    case settingsNotConfigured
    case clientTokenNotConfigured
}
