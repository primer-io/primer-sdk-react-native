import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native', () => ({}), { virtual: true });

const mockFetchCardNetworkDescriptor = jest.fn();
const DEFAULT_DESCRIPTOR = {
  id: 'OTHER',
  displayName: 'Card',
  panLengths: [16, 17, 18, 19],
  gapPattern: [4, 8, 12],
  cvvLength: 3,
  cvvLabel: 'CVV',
};

jest.mock('../../Components/internal/cardNetwork', () => ({
  DEFAULT_DESCRIPTOR,
  fetchCardNetworkDescriptor: (network: string) => mockFetchCardNetworkDescriptor(network),
}));

import { useCardNetworkDescriptor } from '../../Components/hooks/useCardNetworkDescriptor';
import type { CardNetworkDescriptor } from '../../Components/internal/cardNetwork';

const AMEX_DESCRIPTOR: CardNetworkDescriptor = {
  id: 'AMEX',
  displayName: 'American Express',
  panLengths: [15],
  gapPattern: [4, 10],
  cvvLength: 4,
  cvvLabel: 'CID',
};

function captureDescriptor(network: string | null | undefined) {
  const captured: { current: CardNetworkDescriptor | null } = { current: null };
  function Probe({ net }: { net: string | null | undefined }) {
    captured.current = useCardNetworkDescriptor(net);
    return null;
  }
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(Probe, { net: network }));
  });
  return { captured, tree };
}

beforeEach(() => {
  mockFetchCardNetworkDescriptor.mockReset();
});

describe('useCardNetworkDescriptor', () => {
  it('returns DEFAULT_DESCRIPTOR synchronously on first render with a known network', () => {
    mockFetchCardNetworkDescriptor.mockReturnValue(new Promise(() => {}));
    const { captured } = captureDescriptor('AMEX');
    expect(captured.current).toEqual(DEFAULT_DESCRIPTOR);
    expect(mockFetchCardNetworkDescriptor).toHaveBeenCalledWith('AMEX');
  });

  it('returns DEFAULT_DESCRIPTOR and skips fetch when network is null', () => {
    const { captured } = captureDescriptor(null);
    expect(captured.current).toEqual(DEFAULT_DESCRIPTOR);
    expect(mockFetchCardNetworkDescriptor).not.toHaveBeenCalled();
  });

  it('returns DEFAULT_DESCRIPTOR and skips fetch when network is undefined', () => {
    const { captured } = captureDescriptor(undefined);
    expect(captured.current).toEqual(DEFAULT_DESCRIPTOR);
    expect(mockFetchCardNetworkDescriptor).not.toHaveBeenCalled();
  });

  it('upgrades to the resolved descriptor after the fetch promise settles', async () => {
    mockFetchCardNetworkDescriptor.mockResolvedValue(AMEX_DESCRIPTOR);
    const { captured } = captureDescriptor('AMEX');
    expect(captured.current).toEqual(DEFAULT_DESCRIPTOR);
    await act(async () => {
      await Promise.resolve();
    });
    expect(captured.current).toEqual(AMEX_DESCRIPTOR);
  });

  it('does not call setState after unmount when the fetch resolves later', async () => {
    let resolveFetch: (d: CardNetworkDescriptor) => void = () => {};
    mockFetchCardNetworkDescriptor.mockReturnValue(
      new Promise<CardNetworkDescriptor>((resolve) => {
        resolveFetch = resolve;
      })
    );
    const { tree } = captureDescriptor('AMEX');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      tree.unmount();
    });
    await act(async () => {
      resolveFetch(AMEX_DESCRIPTOR);
      await Promise.resolve();
    });
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Can't perform a React state update on an unmounted component")
    );
    errorSpy.mockRestore();
  });
});
