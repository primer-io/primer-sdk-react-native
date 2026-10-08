//
//  RNTPrimerApplePayButtonManager.m
//  primer-io-react-native
//
//  Registers the view for JS as PrimerApplePayButton, beside PrimerGooglePayButton and
//  PrimerKlarnaPaymentView. The remap is needed: RCT_EXTERN_MODULE would strip "Manager" and
//  register RNTPrimerApplePayButton, which the Fabric interop layer would not match.
//

#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(PrimerApplePayButton, RNTPrimerApplePayButtonManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(colorScheme, NSString)
RCT_EXPORT_VIEW_PROPERTY(cornerRadius, CGFloat)

@end
