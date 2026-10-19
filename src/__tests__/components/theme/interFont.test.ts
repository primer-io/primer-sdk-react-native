describe('INTER_FONT_FAMILY', () => {
  const load = (select: (spec: Record<string, string>) => string | undefined) => {
    jest.resetModules();
    jest.doMock('react-native', () => ({ Platform: { select } }));
    return require('../../../Components/internal/theme/typography').INTER_FONT_FAMILY;
  };

  afterEach(() => {
    jest.dontMock('react-native');
  });

  it('names the variable font on iOS', () => {
    expect(load((spec) => spec.ios)).toBe('Inter Variable');
  });

  it('names the font resource on Android', () => {
    expect(load((spec) => spec.default)).toBe('Inter');
  });
});
