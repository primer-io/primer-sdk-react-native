import { createContext, type ComponentRef, type RefObject } from 'react';
import type { View } from 'react-native';

export const InputFieldAnchorContext = createContext<RefObject<ComponentRef<typeof View> | null> | null>(null);
