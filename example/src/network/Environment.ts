export enum Environment {
  Dev = 0,
  Sandbox,
  Staging,
  Production,
}

export function getEnvironmentStringVal(env: Environment): string | undefined {
  switch (env) {
    case Environment.Dev:
      return 'dev';
    case Environment.Sandbox:
      return 'sandbox';
    case Environment.Staging:
      return 'staging';
    case Environment.Production:
      return 'production';
    default:
      return undefined;
  }
}

export function makeEnvironmentFromStringVal(env: string): Environment {
  switch (env) {
    case 'dev':
      return Environment.Dev;
    case 'sandbox':
      return Environment.Sandbox;
    case 'Staging':
      return Environment.Staging;
    case 'production':
      return Environment.Production;
    default:
      throw new Error('Failed to create environment.');
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
      throw new Error('Failed to create environment.');
  }
}

export enum PaymentHandling {
  Auto = 0,
  Manual,
}

export function makePaymentHandlingFromIntVal(env: number): PaymentHandling {
  switch (env) {
    case 0:
      return PaymentHandling.Auto;
    case 1:
      return PaymentHandling.Manual;
    default:
      throw new Error('Failed to create payment handling.');
  }
}

export function makePaymentHandlingFromStringVal(env: string): PaymentHandling {
  switch (env.toUpperCase()) {
    case 'AUTO':
      return PaymentHandling.Auto;
    case 'MANUAL':
      return PaymentHandling.Manual;
    default:
      throw new Error('Failed to create payment handling.');
  }
}

export function getPaymentHandlingStringVal(
  env: PaymentHandling,
): 'AUTO' | 'MANUAL' | undefined {
  switch (env) {
    case PaymentHandling.Auto:
      return 'AUTO';
    case PaymentHandling.Manual:
      return 'MANUAL';
    default:
      return undefined;
  }
}
