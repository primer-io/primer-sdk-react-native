/**
 * Android back inside the checkout sheet (ORC-8671). While the sheet is open, its Modal receives the
 * back press itself (onRequestClose) and BackHandler never fires, so these tests press back through
 * the Modal. The press must do what the top screen's header Back does, and close the sheet only where
 * no Back shows. The sheet, navigator and header are real; the screens are stubs.
 */
// @ts-expect-error: React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement, Fragment, useContext, useState, type ReactElement } from 'react';
// @ts-expect-error: react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { Animated } from 'react-native';

import { CheckoutSheet } from '../../../Components/internal/checkout-sheet/CheckoutSheet';
import { NavigationProvider } from '../../../Components/internal/navigation/NavigationProvider';
import { NavigationContainer } from '../../../Components/internal/navigation/NavigationContainer';
import { NavigationHeader } from '../../../Components/internal/navigation/NavigationHeader';
import type { NavigationHeaderProps } from '../../../Components/internal/navigation/NavigationHeader';
import { NavigationContext } from '../../../Components/internal/navigation/NavigationContext';
import type { NavigationContextValue } from '../../../Components/internal/navigation/NavigationContext';
import { CheckoutRoute } from '../../../Components/internal/navigation/types';

// The header each stub screen draws, set per test. A route without one draws no header at all, like
// processing (LoadingScreen) and the result screens.
let headers: Partial<Record<CheckoutRoute, NavigationHeaderProps>> = {};
let rerenderTopScreen = () => {};

function StubScreen({ route }: { route: CheckoutRoute }) {
  const [, setTick] = useState(0);
  rerenderTopScreen = () => setTick((tick) => tick + 1);
  const header = headers[route];
  return createElement(route, null, header ? createElement(NavigationHeader, header) : null);
}

const stub = (route: CheckoutRoute) => () => createElement(StubScreen, { route });
const screenMap = {
  [CheckoutRoute.methodSelection]: stub(CheckoutRoute.methodSelection),
  [CheckoutRoute.cardForm]: stub(CheckoutRoute.cardForm),
  [CheckoutRoute.countrySelector]: stub(CheckoutRoute.countrySelector),
  [CheckoutRoute.vaultedMethods]: stub(CheckoutRoute.vaultedMethods),
  [CheckoutRoute.processing]: stub(CheckoutRoute.processing),
};
const card = { paymentMethodType: 'PAYMENT_CARD' };
// An animation that never finishes: a sliding-out screen stays mounted, and so does a closing sheet.
const heldAnimation = { start: () => {} } as unknown as ReturnType<typeof Animated.timing>;

let nav!: NavigationContextValue;
function NavProbe() {
  nav = useContext(NavigationContext)!;
  return null;
}

function flow() {
  return createElement(NavigationProvider, {
    initialRoute: CheckoutRoute.methodSelection,
    children: createElement(Fragment, null, createElement(NavProbe), createElement(NavigationContainer, { screenMap })),
  });
}

function sheet(visible: boolean, onRequestDismiss?: () => void) {
  return createElement(CheckoutSheet, { visible, onRequestDismiss, children: flow() });
}

function render(element: ReactElement) {
  let tree: any;
  act(() => {
    tree = create(element);
  });
  return tree;
}

// While the sheet is open, Android back reaches JS only as the sheet Modal's onRequestClose.
function pressBack(tree: any) {
  const modal = tree.root.findByType('Modal');
  act(() => modal.props.onRequestClose());
}
const routes = () => nav.state.stack.map((entry) => entry.route);
const mounted = (tree: any, route: CheckoutRoute) => tree.root.findAllByType(route).length;

describe('Android back in the checkout sheet (ORC-8671)', () => {
  beforeEach(() => {
    headers = {
      [CheckoutRoute.methodSelection]: { title: 'Pay' }, // no Back, like MethodSelectionScreen
      [CheckoutRoute.cardForm]: { showBackButton: true },
      [CheckoutRoute.countrySelector]: { showBackButton: true },
      [CheckoutRoute.vaultedMethods]: { showBackButton: true },
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('goes back one screen where the screen shows a Back button, and keeps the sheet open', () => {
    const onRequestDismiss = jest.fn();
    const tree = render(sheet(true, onRequestDismiss));
    act(() => nav.push(CheckoutRoute.cardForm, card));
    act(() => nav.push(CheckoutRoute.countrySelector, {}));

    pressBack(tree);

    expect(routes()).toEqual([CheckoutRoute.methodSelection, CheckoutRoute.cardForm]);
    expect(mounted(tree, CheckoutRoute.cardForm)).toBe(1);
    expect(mounted(tree, CheckoutRoute.countrySelector)).toBe(0);
    expect(onRequestDismiss).not.toHaveBeenCalled();
  });

  it('closes the sheet on the first screen', () => {
    const onRequestDismiss = jest.fn();
    const tree = render(sheet(true, onRequestDismiss));
    act(() => nav.push(CheckoutRoute.vaultedMethods));

    pressBack(tree);
    expect(routes()).toEqual([CheckoutRoute.methodSelection]);
    expect(onRequestDismiss).not.toHaveBeenCalled();

    pressBack(tree);
    expect(onRequestDismiss).toHaveBeenCalledTimes(1);
  });

  it("runs the screen's own Back action instead of a plain pop", () => {
    // Stands in for the saved-cards no-op while deleting, and ACH's stopAch before pop.
    const onBackPress = jest.fn();
    headers[CheckoutRoute.vaultedMethods] = { showBackButton: true, onBackPress };
    const onRequestDismiss = jest.fn();
    const tree = render(sheet(true, onRequestDismiss));
    act(() => nav.push(CheckoutRoute.vaultedMethods));

    pressBack(tree);

    expect(onBackPress).toHaveBeenCalledTimes(1);
    expect(routes()).toEqual([CheckoutRoute.methodSelection, CheckoutRoute.vaultedMethods]);
    expect(onRequestDismiss).not.toHaveBeenCalled();
  });

  it('runs the Back action of the latest render', () => {
    const first = jest.fn();
    const latest = jest.fn();
    headers[CheckoutRoute.vaultedMethods] = { showBackButton: true, onBackPress: first };
    const tree = render(sheet(true, jest.fn()));
    act(() => nav.push(CheckoutRoute.vaultedMethods));
    headers[CheckoutRoute.vaultedMethods] = { showBackButton: true, onBackPress: latest };
    act(() => rerenderTopScreen());

    pressBack(tree);

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it('follows the Back button as the screen hides and shows it', () => {
    // ACH hides Back while the bank link runs; back there closes the sheet, as it does today.
    headers[CheckoutRoute.vaultedMethods] = { showBackButton: false };
    const onRequestDismiss = jest.fn();
    const tree = render(sheet(true, onRequestDismiss));
    act(() => nav.push(CheckoutRoute.vaultedMethods));

    pressBack(tree);
    expect(onRequestDismiss).toHaveBeenCalledTimes(1);
    expect(routes()).toEqual([CheckoutRoute.methodSelection, CheckoutRoute.vaultedMethods]);

    headers[CheckoutRoute.vaultedMethods] = { showBackButton: true };
    act(() => rerenderTopScreen());
    pressBack(tree);
    expect(routes()).toEqual([CheckoutRoute.methodSelection]);
    expect(onRequestDismiss).toHaveBeenCalledTimes(1);
  });

  it('closes the sheet, without popping, on an inner screen with no Back button', () => {
    // Pay replaces the card form with processing, on top of the method list.
    const onRequestDismiss = jest.fn();
    const tree = render(sheet(true, onRequestDismiss));
    act(() => nav.push(CheckoutRoute.cardForm, card));
    act(() => nav.replace(CheckoutRoute.processing));

    pressBack(tree);

    expect(routes()).toEqual([CheckoutRoute.methodSelection, CheckoutRoute.processing]);
    expect(onRequestDismiss).toHaveBeenCalledTimes(1);
  });

  it('never runs the Back of a screen still sliding out', () => {
    const cardBack = jest.fn();
    headers[CheckoutRoute.cardForm] = { showBackButton: true, onBackPress: cardBack };
    const onRequestDismiss = jest.fn();
    const tree = render(sheet(true, onRequestDismiss));
    act(() => nav.push(CheckoutRoute.cardForm, card));
    jest.spyOn(Animated, 'timing').mockReturnValue(heldAnimation);
    act(() => nav.replace(CheckoutRoute.processing));
    expect(mounted(tree, CheckoutRoute.cardForm)).toBe(1); // sliding out, its Back still registered

    pressBack(tree);

    expect(cardBack).not.toHaveBeenCalled();
    expect(onRequestDismiss).toHaveBeenCalledTimes(1);
  });

  it('asks the host to close again, without popping, while the sheet is closing', () => {
    const onRequestDismiss = jest.fn();
    const tree = render(sheet(true, onRequestDismiss));
    act(() => nav.push(CheckoutRoute.vaultedMethods));
    jest.spyOn(Animated, 'timing').mockReturnValue(heldAnimation); // the slide-out never ends
    act(() => tree.update(sheet(false, onRequestDismiss)));

    pressBack(tree);

    expect(onRequestDismiss).toHaveBeenCalledTimes(1);
    expect(routes()).toEqual([CheckoutRoute.methodSelection, CheckoutRoute.vaultedMethods]);
  });

  it('without onRequestDismiss, still goes back a screen and does nothing on the first screen', () => {
    const tree = render(sheet(true));
    act(() => nav.push(CheckoutRoute.vaultedMethods));

    pressBack(tree);
    expect(routes()).toEqual([CheckoutRoute.methodSelection]);

    expect(() => pressBack(tree)).not.toThrow();
    expect(routes()).toEqual([CheckoutRoute.methodSelection]);
  });

  it('works outside a sheet: nothing to register with, and the header Back still pops', () => {
    const tree = render(flow());
    act(() => nav.push(CheckoutRoute.vaultedMethods));
    const back = tree.root.findByType('TouchableOpacity');

    act(() => back.props.onPress());

    expect(routes()).toEqual([CheckoutRoute.methodSelection]);
  });
});
