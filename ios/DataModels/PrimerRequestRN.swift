struct PrimerInitRequest: Decodable {
    let intent: String;
    let token: String;
    let metadata: PrimerRequestMetadata?;
}

struct PrimerResumeRequest: Decodable {
    let error: String?
    let token: String?
}

struct PrimerRequestMetadata: Decodable {
    let message: String?
}