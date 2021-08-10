//
//  PrimerRequestRN.swift
//  primer-io-react-native
//
//  Created by Carl Eriksson on 10/08/2021.
//

struct PrimerInitRequest: Decodable {
    let intent: String;
    let token: String;
    let metadata: PrimerRequestMetadata?;
}

struct PrimerResumeRequest: Decodable {
    let intent: String;
    let token: String;
    let metadata: PrimerRequestMetadata?;
}

struct PrimerRequestMetadata: Decodable {
    let message: String?
}
