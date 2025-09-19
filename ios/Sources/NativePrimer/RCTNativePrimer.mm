//
//  RCTNativePrimer.mm
//  primer-io-react-native
//

#import "RCTNativePrimer.h"
#import "primer_io_react_native-Swift.h"

#ifdef RCT_NEW_ARCH_ENABLED
#import <NativePrimerSpec/NativePrimerSpec.h>
#endif

@interface RCTNativePrimer()
@property (nonatomic, strong) RNTPrimer *primer;
@end

@implementation RCTNativePrimer

RCT_EXPORT_MODULE(NativePrimer)

- (instancetype)init {
    if (self = [super init]) {
         _primer = [RNTPrimer alloc];
      }
    [_primer setEventDelegate:self];
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

#pragma mark - Old Architecture Methods
RCT_EXPORT_METHOD(configure:(NSString *)settings
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer configure:settings resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(handlePaymentCreationAbort:(NSString *)errorMessage
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer handlePaymentCreationAbort:errorMessage resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(handlePaymentCreationContinue:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer handlePaymentCreationContinue:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(handleResumeFailure:(NSString *)errorMessage
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer handleResumeFailure:errorMessage resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(handleResumeSuccess:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer handleResumeSuccess:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(handleResumeWithNewClientToken:(NSString *)newClientToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer handleResumeWithNewClientToken:newClientToken resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(handleTokenizationFailure:(NSString *)errorMessage
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer handleTokenizationFailure:errorMessage resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(handleTokenizationNewClientToken:(NSString *)newClientToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer handleTokenizationNewClientToken:newClientToken resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(handleTokenizationSuccess:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer handleTokenizationSuccess:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(setImplementedRNCallbacks:(NSString *)implementedRNCallbacks
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer setImplementedRNCallbacks:implementedRNCallbacks resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(showErrorMessage:(NSString *)errorMessage
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer showErrorMessage:errorMessage resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(showUniversalCheckoutWithClientToken:(NSString *)clientToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer showUniversalCheckoutWithClientToken:clientToken resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(showVaultManagerWithClientToken:(NSString *)clientToken
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    [self.primer showVaultManagerWithClientToken:clientToken resolver:resolve rejecter:reject];
}

RCT_EXPORT_METHOD(dismiss:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.primer dismiss];
    resolve(nil);
}

RCT_EXPORT_METHOD(cleanUp:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    [self.primer cleanUp];
    resolve(nil);
}

#ifdef RCT_NEW_ARCH_ENABLED
#pragma mark - New Architecture Protocol Methods

- (void)configure:(nonnull NSString *)settings resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer configure:settings resolver:resolve rejecter:reject];
}

- (void)handlePaymentCreationAbort:(nonnull NSString *)errorMessage resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer handlePaymentCreationAbort:errorMessage resolver:resolve rejecter:reject];
}

- (void)handlePaymentCreationContinue:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer handlePaymentCreationContinue:resolve rejecter:reject];
}

- (void)handleResumeFailure:(nonnull NSString *)errorMessage resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer handleResumeFailure:errorMessage resolver:resolve rejecter:reject];
}

- (void)handleResumeSuccess:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer handleResumeSuccess:resolve rejecter:reject];
}

- (void)handleResumeWithNewClientToken:(nonnull NSString *)newClientToken resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer handleResumeWithNewClientToken:newClientToken resolver:resolve rejecter:reject];
}

- (void)handleTokenizationFailure:(nonnull NSString *)errorMessage resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer handleTokenizationFailure:errorMessage resolver:resolve rejecter:reject];
}

- (void)handleTokenizationNewClientToken:(nonnull NSString *)newClientToken resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer handleTokenizationNewClientToken:newClientToken resolver:resolve rejecter:reject];
}

- (void)handleTokenizationSuccess:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer handleTokenizationSuccess:resolve rejecter:reject];
}

- (void)setImplementedRNCallbacks:(nonnull NSString *)implementedRNCallbacks resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer setImplementedRNCallbacks:implementedRNCallbacks resolver:resolve rejecter:reject];
}

- (void)showErrorMessage:(nonnull NSString *)errorMessage resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer showErrorMessage:errorMessage resolver:resolve rejecter:reject];
}

- (void)showUniversalCheckoutWithClientToken:(nonnull NSString *)clientToken resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer showUniversalCheckoutWithClientToken:clientToken resolver:resolve rejecter:reject];
}

- (void)showVaultManagerWithClientToken:(nonnull NSString *)clientToken resolve:(nonnull RCTPromiseResolveBlock)resolve reject:(nonnull RCTPromiseRejectBlock)reject { 
    [self.primer showVaultManagerWithClientToken:clientToken resolver:resolve rejecter:reject];
}

#pragma mark - TurboModule
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativePrimerSpecJSI>(params);
}
#endif

#pragma mark - Event Emitting

- (void)sendEventWithName:(NSString *)eventName body:(NSDictionary * _Nullable)body {
#ifdef RCT_NEW_ARCH_ENABLED
    [self emitOnEvent:@{@"eventType": eventName, @"data": body ?: @{}}];
#else
    [super sendEventWithName:eventName body:body];
#endif
}

- (NSArray<NSString *> *)supportedEvents {
   return @[@"onCheckoutComplete",
            @"onBeforeClientSessionUpdate",
            @"onClientSessionUpdate",
            @"onBeforePaymentCreate",
            @"onDismiss",
            @"onTokenizeSuccess",
            @"onResumeSuccess",
            @"onResumePending",
            @"onCheckoutReceivedAdditionalInfo",
            @"onError",
            @"detectImplementedRNCallbacks"];
}

@end
