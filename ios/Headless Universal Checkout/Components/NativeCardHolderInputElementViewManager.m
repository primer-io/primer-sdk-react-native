//
//  NativeCardHolderInputElementViewManager.m
//  primer-io-react-native
//
//  Created by Evangelos on 21/6/22.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(NativeCardHolderInputElementViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(placeholder, NSString)

RCT_EXPORT_VIEW_PROPERTY(onFocus, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onBlur, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onValueChange, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onValueIsValid, RCTBubblingEventBlock)

@end