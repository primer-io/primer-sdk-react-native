export enum Environment {
    Dev = 0,
    Sandbox,
    Staging,
    Production,
}

export function getEnvironmentStringVal(env: Environment): string {
    switch (env) {
    case Environment.Dev:
        return "dev"
    case Environment.Sandbox:
        return "sandbox"
    case Environment.Staging:
        return "staging"
    case Environment.Production:
        return "production"
    default:
            return "unknown"
    }
}

export function makeEnvironmentFromStringVal(env: string): Environment {
    switch (env) {
    case "dev":
        return Environment.Dev;
    case "sandbox":
        return Environment.Sandbox;
    case "Staging":
        return Environment.Staging;
    case "production":
        return Environment.Production;
    default:
        throw new Error("Failed to create environment.");
    }
}

export function makeEnvironmentFromIntVal(env: number): Environment {
    switch (env) {
    case 0:
        return Environment.Dev;
    case 1:
        return Environment.Sandbox;
    case 2:
        return Environment.Staging;
    case 3:
        return Environment.Production;
    default:
        throw new Error("Failed to create environment.");
    }
}