// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerCardNetworkSelector } from '../../Components/PrimerCardNetworkSelector';
import { InputFieldAnchorContext } from '../../Components/internal/inputFieldAnchor';
import { Popover, type PopoverAnchor } from '../../Components/internal/Popover';

jest.mock('../../Components/hooks/usePrimerCardNetworkSelection', () => ({
  usePrimerCardNetworkSelection: () => ({
    availableNetworks: [
      { identifier: 'VISA', displayName: 'Visa' },
      { identifier: 'CARTES_BANCAIRES', displayName: 'Cartes Bancaires' },
    ],
    displayedIdentifier: 'VISA',
    isSelectorVisible: true,
    isDualBadge: false,
    selectNetwork: jest.fn(),
  }),
}));

jest.mock('../../Components/internal/CardNetworkBadge', () => ({ CardNetworkBadge: () => null }));

const selector = { x: 280, y: 317, width: 79, height: 24 };
const field = { x: 16, y: 300, width: 343, height: 58 };

const inWindow = (rect: PopoverAnchor) => ({
  measureInWindow: (onMeasured: (x: number, y: number, width: number, height: number) => void) =>
    onMeasured(rect.x, rect.y, rect.width, rect.height),
});

function openMenu(fieldRef: { current: unknown } | null) {
  let tree: any;
  act(() => {
    const element = createElement(PrimerCardNetworkSelector, { testID: 'selector' });
    tree = renderer.create(createElement(InputFieldAnchorContext.Provider, { value: fieldRef as any }, element), {
      createNodeMock: () => inWindow(selector),
    });
  });
  act(() => tree.root.findByProps({ testID: 'selector-trigger' }).props.onPress());
  return tree;
}

const menuAnchor = (tree: any) => tree.root.findByType(Popover).props.anchor;

describe('PrimerCardNetworkSelector menu', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.assign(globalThis, {
      requestAnimationFrame: (onFrame: () => void) => setTimeout(onFrame, 16),
      cancelAnimationFrame: (frame: ReturnType<typeof setTimeout>) => clearTimeout(frame),
    });
  });
  afterEach(() => jest.useRealTimers());

  it('opens below the field, ending at its right edge', () => {
    const tree = openMenu({ current: inWindow(field) });

    expect(menuAnchor(tree)).toEqual(field);
  });

  it('opens below the selector outside a field', () => {
    expect(menuAnchor(openMenu(null))).toEqual(selector);
  });

  it('follows the field when the sheet moves it', () => {
    const fieldRef = { current: inWindow(field) };
    const tree = openMenu(fieldRef);

    fieldRef.current = inWindow({ ...field, y: 612 });
    act(() => jest.advanceTimersByTime(20));

    expect(menuAnchor(tree)).toEqual({ ...field, y: 612 });
  });

  it('stops measuring the field once the menu closes', () => {
    const fieldInWindow = { measureInWindow: jest.fn(inWindow(field).measureInWindow) };
    const tree = openMenu({ current: fieldInWindow });

    act(() => tree.root.findByType(Popover).props.onDismiss());
    const measuredWhileOpen = fieldInWindow.measureInWindow.mock.calls.length;
    act(() => jest.advanceTimersByTime(100));

    expect(fieldInWindow.measureInWindow).toHaveBeenCalledTimes(measuredWhileOpen);
  });
});
