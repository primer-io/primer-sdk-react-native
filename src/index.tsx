import type { IPrimer } from './models/IPrimer';
import { PrimerNativeMapping } from './Primer';
import type { PrimerSettings as IPrimerSettings } from './models/PrimerSettings';

const Primer: IPrimer = PrimerNativeMapping;

export { Primer, IPrimerSettings };
