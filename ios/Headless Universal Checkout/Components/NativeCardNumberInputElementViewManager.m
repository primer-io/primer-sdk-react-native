//
//  NativeCardNumberInputElementViewManager.m
//  primer-io-react-native
//
//  Created by Evangelos on 20/6/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(NativeCardNumberInputElementViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(placeholder, NSString)

RCT_EXPORT_VIEW_PROPERTY(onFocus, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onBlur, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onValueChange, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onValueIsValid, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onValueTypeDetect, RCTBubblingEventBlock)

//RCT_EXPORT_METHOD(registerInputElement:(nonnull NSNumber*) reactTag)

@end
