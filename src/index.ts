import PrimerContainer from './components/components/PrimerContainer';
import PrimerInput from './components/components/PrimerInput';
import useComponents from './components/hooks/use-components';
import useConfiguration from './components/providers/ConfigurationProvider';
import useError from './components/providers/ErrorProvider';
import type { IPrimer } from './models/primer';
import { PrimerNativeMapping } from './Primer';

const Primer: IPrimer = PrimerNativeMapping;

const Components = { useComponents, useError, useConfiguration, PrimerInput };

export { Primer, Components, PrimerContainer };
