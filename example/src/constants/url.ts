import { generateRandomString } from "../api/utils";

export const root =
  'https://api.sandbox.primer.io';

  export const baseHeaders = {
    'Content-Type': 'application/json',
    'X-Idempotency-Key': generateRandomString(16),  // Not required, but useful
    'X-Api-Key': '',
  };
