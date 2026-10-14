/**
 * Contract tests for the Stripe ACH public API
 * (specs/004-stripe-ach-components/contracts/stripe-ach-public-api.md).
 *
 *   A1 — the ACH surface is exported from both barrels under ADR-A names.
 *   A2 — the generic hook's union gains the `stripeAch` variant with the contracted members.
 *   A3 — `PaymentOutcome` carries the `'pending'` member; the category union carries `'STRIPE_ACH'`.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = join(__dirname, '..', '..');

function readSource(relative: string): string {
  return readFileSync(join(SRC, relative), 'utf8');
}

/** Collect identifiers from `export type { ... } from '...'` statements. */
function typeExports(source: string): string[] {
  const names: string[] = [];
  const re = /export\s+type\s*\{([^}]*)\}\s*from/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const group = match[1] ?? '';
    for (const raw of group.split(',')) {
      const name = raw
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name) names.push(name);
    }
  }
  return names;
}

const ACH_TYPE_SURFACE = [
  'StripeAchPaymentMethod',
  'StripeAchStep',
  'StripeAchUserDetails',
  'StripeAchFieldErrors',
  'StripeAchMandateDisplay',
];

describe('A1: ACH type surface is exported from both barrels', () => {
  const componentsExports = typeExports(readSource('Components/index.ts'));
  const rootExports = typeExports(readSource('index.tsx'));

  it.each(ACH_TYPE_SURFACE)('Components barrel exports type %s', (name) => {
    expect(componentsExports).toContain(name);
  });

  it.each(ACH_TYPE_SURFACE)('root barrel exports type %s', (name) => {
    expect(rootExports).toContain(name);
  });
});

describe('A2: the stripeAch variant carries the contracted members', () => {
  const variants = readSource('Components/types/PrimerPaymentMethodTypes.ts');

  it('is part of the UsePrimerPaymentMethodReturn union', () => {
    expect(variants).toMatch(/UsePrimerPaymentMethodReturn\s*=[\s\S]*StripeAchPaymentMethod/);
  });

  it.each([
    "kind: 'stripeAch'",
    'readonly isAvailable',
    'readonly step',
    'readonly userDetails',
    'readonly fieldErrors',
    'readonly isValid',
    'readonly mandate',
    'readonly paymentOutcome',
    'start()',
    'setFirstName(',
    'setLastName(',
    'setEmailAddress(',
    'submit()',
    'acceptMandate()',
    'declineMandate()',
    'clearPaymentOutcome()',
  ])('declares %s', (member) => {
    expect(variants).toContain(member);
  });
});

describe('A3: supporting unions gained their ACH members', () => {
  it("PaymentOutcome includes the 'pending' status", () => {
    const types = readSource('Components/types/PrimerCheckoutProviderTypes.ts');
    expect(types).toMatch(/status:\s*'pending'/);
  });

  it("the manager-category union includes 'STRIPE_ACH'", () => {
    const model = readSource('models/PrimerHeadlessUniversalCheckoutPaymentMethod.ts');
    expect(model).toContain("'STRIPE_ACH'");
  });

  it('routeMethodSelection routes the STRIPE_ACH category', () => {
    const router = readSource('Components/internal/routeMethodSelection.ts');
    expect(router).toMatch(/includes\('STRIPE_ACH'\)/);
  });
});
