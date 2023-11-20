export enum APIVersion {
    v1 = 0,
    v2,
    v3,
    v4,
    v5
}

export function getAPIVersionStringVal(apiVersion: APIVersion): string | undefined {
    switch (apiVersion) {
        case APIVersion.v1:
            return undefined
        case APIVersion.v2:
            return "2021-09-27"
        case APIVersion.v3:
            return "2.2"
        case APIVersion.v4:
            return "2021-12-01"
        case APIVersion.v5:
            return "2021-12-10"
    }
}
