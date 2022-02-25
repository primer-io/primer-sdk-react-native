import type { IPrimer } from './models/primer';
import { PrimerNativeMapping } from './Primer';
export * from './PrimerInput';

const Primer: IPrimer = PrimerNativeMapping;

export { Primer };
