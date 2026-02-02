//
//  RCTNativePrimer.h
//  primer-io-react-native
//
//  Created by Semir on 17/09/2025.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <NativePrimerSpec/NativePrimerSpec.h>

@interface RCTNativePrimer: RCTEventEmitter <RCTBridgeModule, NativePrimerSpec>
#else

@interface RCTNativePrimer: RCTEventEmitter <RCTBridgeModule>
#endif

@end
