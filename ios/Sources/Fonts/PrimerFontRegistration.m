#import <CoreText/CoreText.h>
#import <Foundation/Foundation.h>

@interface PrimerFontRegistration : NSObject
@end

@implementation PrimerFontRegistration

// Registered at load, before any text is laid out: RCTFont caches the system fallback if the family is missing on first use.
+ (void)load {
    NSURL *fontURL = [[NSBundle bundleForClass:self] URLForResource:@"PrimerInterVariable" withExtension:@"ttf"]
        ?: [[NSBundle mainBundle] URLForResource:@"PrimerInterVariable" withExtension:@"ttf"];
    if (fontURL) {
        CTFontManagerRegisterFontsForURL((__bridge CFURLRef)fontURL, kCTFontManagerScopeProcess, NULL);
    }
}

@end
