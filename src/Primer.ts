import type { PrimerSettings } from './models/primer-settings';
import type { PrimerTheme } from './models/primer-theme';
import NativePrimer from './NativePrimer';

class PrimerClass {

    onClientTokenCallback: (() => void) | null = null;

    constructor() {
        this.configureListeners();
    }

    private configureListeners() {
        NativePrimer.addListener(
          'onClientTokenCallback',
          () => {
            console.log('onClientTokenCallback');
            if (this.onClientTokenCallback) {
                this.onClientTokenCallback();
            }
          }
        );
    
        NativePrimer.addListener(
          'onError',
          () => {
            console.log('onError');
          }
        );
    }

    ///////////////////////////////////////////
    // API
    ///////////////////////////////////////////
    configure(settings: PrimerSettings | null, theme: PrimerTheme | null): Promise<void> {
        return NativePrimer.configure(settings, theme);
    }

    showUniversalCheckout(clientToken: string | undefined): Promise<void> {
        return NativePrimer.showUniversalCheckout(clientToken);
    }

    setClientToken(clientToken: string): Promise<void> {
        return NativePrimer.setClientToken(clientToken);
    }
}

const Primer = new PrimerClass();

export default Primer;