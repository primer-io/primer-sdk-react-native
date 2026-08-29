import { Animated } from 'react-native';
import { renderCurrentAnim, renderOutgoingAnim } from '../../../Components/internal/navigation/NavigationContainer';

// Regression guard: RN 0.86's synchronous mount asserts on a removed opacity/transform prop,
// so every transition type must return both keys (present, not just truthy) in both helpers.
const TRANSITION_TYPES = ['push', 'pop', 'replace', 'none'] as const;

describe('navigation transition anim helpers', () => {
  const animValue = new Animated.Value(1);
  const width = 375;

  for (const type of TRANSITION_TYPES) {
    it(`renderCurrentAnim(${type}) keeps both opacity and transform`, () => {
      const style = renderCurrentAnim(type, animValue, width);
      expect('opacity' in style).toBe(true);
      expect('transform' in style).toBe(true);
      expect(Array.isArray(style.transform)).toBe(true);
    });

    it(`renderOutgoingAnim(${type}) keeps both opacity and transform`, () => {
      const style = renderOutgoingAnim(type, animValue, width);
      expect('opacity' in style).toBe(true);
      expect('transform' in style).toBe(true);
      expect(Array.isArray(style.transform)).toBe(true);
    });
  }
});
