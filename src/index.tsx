import type { IPrimer } from './models/primer';
import { PrimerNativeMapping } from './Primer';
// import type { IPrimerConfig as PrimerConfig } from './models/primer-config';

const Primer: IPrimer = PrimerNativeMapping;

export { Primer };
