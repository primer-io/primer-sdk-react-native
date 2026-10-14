// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock('../../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ pop: jest.fn() }),
}));
jest.mock('../../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: { iconPrimary: '#00f', textPrimary: '#000' },
    spacing: { xxsmall: 2, xsmall: 4, small: 8, medium: 12, large: 16, xlarge: 20, xxlarge: 24 },
    radii: { small: 4 },
    typography: {
      titleLarge: { fontFamily: 'system', fontSize: 16, fontWeight: '500', letterSpacing: 0, lineHeight: 20 },
      titleXlarge: { fontFamily: 'system', fontSize: 24, fontWeight: '600', letterSpacing: 0, lineHeight: 32 },
    },
  }),
}));

import { NavigationHeader } from '../../../Components/internal/navigation/NavigationHeader';

const BACK_ROW_HEIGHT = 24;

function flatten(style: unknown): Record<string, unknown> {
  return [style].flat(Infinity).reduce<Record<string, unknown>>((all, s) => ({ ...all, ...(s as object) }), {});
}

function renderTitle(props: Record<string, unknown>) {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(NavigationHeader, { title: 'Klarna', backLabel: 'Back', ...props }));
  });
  const titles = tree.root.findAll((node: any) => node.type === 'Text' && node.props.children === 'Klarna');
  expect(titles).toHaveLength(1);
  return titles[0];
}

// The ancestor Views of a node, nearest first, with their flattened styles and pointerEvents.
function ancestors(node: any) {
  const views = [];
  for (let parent = node.parent; parent != null; parent = parent.parent) {
    if (parent.type === 'View')
      views.push({ style: flatten(parent.props.style), pointerEvents: parent.props.pointerEvents });
  }
  return views;
}

describe('NavigationHeader — title placement', () => {
  it('draws the title large, under the back row, by default', () => {
    const title = renderTitle({ showBackButton: true });

    expect(flatten(title.props.style).fontSize).toBe(24);
    expect(ancestors(title).some((view) => view.style.height === BACK_ROW_HEIGHT)).toBe(false);
  });

  it.each([
    ['with the back button', true],
    ['without it, as while the screen slides out after Back', false],
  ])('draws a centred title on one line inside the back row, letting taps through, %s', (_, showBackButton) => {
    const title = renderTitle({ showBackButton, titleAlignment: 'center' });
    const [box, row] = ancestors(title);

    expect(flatten(title.props.style).fontSize).toBe(16);
    expect(title.props.numberOfLines).toBe(1);
    expect(box).toMatchObject({ pointerEvents: 'none', style: { alignItems: 'center', justifyContent: 'center' } });
    expect(row?.style.height).toBe(BACK_ROW_HEIGHT);
  });
});
