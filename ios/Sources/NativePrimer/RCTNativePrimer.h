//
//  RCTNativePrimer.h
//  primer-io-react-native
//
//  Created by Semir on 17/09/2025.
//

#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <NativePrimerSpec/NativePrimerSpec.h>

@interface RCTNativePrimer: NativePrimerSpecBase <RCTBridgeModule, NativePrimerSpec>
#else
#import <React/RCTEventEmitter.h>

@interface RCTNativePrimer: RCTEventEmitter <RCTBridgeModule>
#endif

@end
