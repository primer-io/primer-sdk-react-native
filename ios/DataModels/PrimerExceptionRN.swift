//
//  PrimerExceptionRN.swift
//  ReactNative
//
//  Created by Carl Eriksson on 10/08/2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

struct PrimerExceptionRN: Encodable {
    let exceptionType: ExceptionTypeRN
    let description: String?
}

enum ExceptionTypeRN: String, Error, Encodable {
    case ParseJsonFailed
    case noIosViewController
    case invalidPrimerIntent
    case themeParsingFailed
    case settingsParsingFailed
    case settingsNotConfigured
    case clientTokenNotConfigured
    case flowParsingFailed
}
