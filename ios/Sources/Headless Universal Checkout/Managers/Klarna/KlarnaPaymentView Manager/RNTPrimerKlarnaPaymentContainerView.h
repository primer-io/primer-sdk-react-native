//
//  RNTPrimerKlarnaPaymentContainerView.h
//  primer-io-react-native
//

#import <React/RCTComponent.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNTPrimerKlarnaPaymentContainerView : UIView

@property (nonatomic, copy, nullable) RCTDirectEventBlock onContentHeightChange;

- (void)hostPaymentView:(UIView *)paymentView;

- (void)contentHeightDidChange:(CGFloat)height;

@end

NS_ASSUME_NONNULL_END
