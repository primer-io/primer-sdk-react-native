import type { PrimerSettings } from "./PrimerSettings";

export interface IPrimer {
  configure(settings: PrimerSettings): Promise<void>;
  showUniversalCheckout(clientToken: string): Promise<void>;
  showVaultManager(clientToken: string): Promise<void>;
  dismiss(): void;
  dispose(): void;
}
