#import "RCTPrimerViewUtils.h"
#import "PrimerSwiftInterop.h"

@interface RCTPrimerViewUtils ()
@property (nonatomic, strong) RNTPrimerViewUtils *viewUtils;
@end

@implementation RCTPrimerViewUtils

RCT_EXPORT_MODULE(PrimerViewUtils)

- (instancetype)init {
    if (self = [super init]) {
        _viewUtils = [[RNTPrimerViewUtils alloc] init];
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

RCT_EXPORT_METHOD(getBottomSafeAreaInset:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.viewUtils getBottomSafeAreaInset:resolve rejecter:reject];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (void)getBottomSafeAreaInset:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject {
    [self.viewUtils getBottomSafeAreaInset:resolve rejecter:reject];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativePrimerViewUtilsSpecJSI>(params);
}
#endif

@end
