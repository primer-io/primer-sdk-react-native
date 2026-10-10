//
//  RNTPrimerKlarnaPaymentViewManager.h
//  Pods
//
//  Created by Stefan Vrancianu on 08.04.2024.
//

#import <React/RCTViewManager.h>

@interface RNTPrimerKlarnaPaymentViewManager : RCTViewManager

+ (void)updatePrimerKlarnaPaymentView:(nullable UIView *)view;

+ (void)updatePrimerKlarnaPaymentViewContentHeight:(CGFloat)height;

+ (CGFloat)primerKlarnaPaymentViewContentHeight;

@end
