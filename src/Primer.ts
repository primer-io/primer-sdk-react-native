import { NativeModules, NativeEventEmitter } from 'react-native';
export const { PrimerNative: NativeModule } = NativeModules;

class PrimerClass {

    onClientTokenCallback: (() => void) | null = null;

    constructor() {

    }
}