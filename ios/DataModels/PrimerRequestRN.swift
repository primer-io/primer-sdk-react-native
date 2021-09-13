struct PrimerInitRequest: Decodable {
    let intent: String;
    let token: String;
    let metadata: PrimerRequestMetadata?;
}

struct PrimerResumeRequest: Decodable {
    let error: Bool;
}

struct PrimerRequestMetadata: Decodable {
    let message: String?
}
