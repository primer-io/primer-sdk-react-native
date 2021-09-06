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
