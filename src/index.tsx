// import { Platform } from 'react-native';
// import { UniversalCheckout as AndroidImpl } from './UniversalCheckout.android';
// import { UniversalCheckout as IOSImpl } from './UniversalCheckout.ios';
import { Primer as IOSImpl, IPrimer } from './Primer.ios';

// const Primer: Primer = Platform.OS === 'ios' ? IOSImpl : AndroidImpl;
const Primer: IPrimer = IOSImpl;

export { Primer };
