import { mergeTokens } from '../../../Components/internal/theme/merge';
import { defaultDarkTokens, defaultLightTokens } from '../../../Components/internal/theme/tokens';
import type { PrimerTokens } from '../../../Components/internal/theme/types';
import type { Spec } from '../../../specs/NativePrimerViewUtils';

const mockIsFontAvailable = jest.fn<Promise<boolean>, [string]>();
const workingModule: Partial<Spec> = { isFontAvailable: (family: string) => mockIsFontAvailable(family) };

type MissingFonts = typeof import('../../../Components/internal/theme/missingFonts');

// A fresh module per test, so the once-per-family memory starts empty.
function load(nativeModule: Partial<Spec> | null = workingModule): MissingFonts {
  let mod: MissingFonts | undefined;
  jest.isolateModules(() => {
    jest.doMock('../../../specs/NativePrimerViewUtils', () => ({ __esModule: true, default: nativeModule }));
    mod = require('../../../Components/internal/theme/missingFonts');
  });
  return mod as MissingFonts;
}

function lightWithFont(fontFamily: string): PrimerTokens {
  return mergeTokens(defaultLightTokens, { typography: { fontFamily } });
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('missing font warning', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    mockIsFontAvailable.mockReset();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('checks each merchant font once, across both modes', () => {
    mockIsFontAvailable.mockResolvedValue(true);
    const light = mergeTokens(defaultLightTokens, {
      typography: { fontFamily: 'Brand', bodySmall: { fontFamily: 'Small' } },
    });
    const dark = mergeTokens(defaultDarkTokens, {
      typography: { fontFamily: 'Brand', titleLarge: { fontFamily: 'Title' } },
    });

    load().warnAboutMissingFonts([light, dark]);

    expect(mockIsFontAvailable.mock.calls.map(([family]) => family).sort()).toEqual(['Brand', 'Small', 'Title']);
  });

  it("never checks Primer's own font", () => {
    load().warnAboutMissingFonts([defaultLightTokens, defaultDarkTokens]);

    expect(mockIsFontAvailable).not.toHaveBeenCalled();
  });

  it('warns once for a font the app does not have', async () => {
    mockIsFontAvailable.mockResolvedValue(false);
    const { warnAboutMissingFonts } = load();

    warnAboutMissingFonts([lightWithFont('Missing')]);
    warnAboutMissingFonts([lightWithFont('Missing')]);
    await flush();

    expect(mockIsFontAvailable).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('"Missing"');
  });

  it('stays quiet for a font the app has', async () => {
    mockIsFontAvailable.mockResolvedValue(true);

    load().warnAboutMissingFonts([lightWithFont('Present')]);
    await flush();

    expect(warn).not.toHaveBeenCalled();
  });

  it('skips the check on a native build that does not have it yet', () => {
    const { warnAboutMissingFonts } = load({});

    expect(() => warnAboutMissingFonts([lightWithFont('Any')])).not.toThrow();
  });
});
