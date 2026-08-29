#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <NativePrimerSpec/NativePrimerSpec.h>
@interface RCTPrimerViewUtils : NSObject <RCTBridgeModule, NativePrimerViewUtilsSpec>
#else
@interface RCTPrimerViewUtils : NSObject <RCTBridgeModule>
#endif

@end
