//
//  VaultManager.m
//  primer-io-react-native
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNPrimerHeadlessUniversalCheckoutVaultManager, RCTEventEmitter)

// MARK: - API

RCT_EXTERN_METHOD(configure: (RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(fetchVaultedPaymentMethods:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(deleteVaultedPaymentMethod:(NSString *)vaultedPaymentMethodId resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(validate:(NSString *)vaultedPaymentMethodId additionalDataStr:(NSString *)additionalDataStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(startPaymentFlow:(NSString *)vaultedPaymentMethodId resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(startPaymentFlowWithAdditionalData:(NSString *)vaultedPaymentMethodId additionalDataStr:(NSString *)additionalDataStr resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter)

@end
