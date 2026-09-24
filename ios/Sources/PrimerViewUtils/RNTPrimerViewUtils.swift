import UIKit

@objc public class RNTPrimerViewUtils: NSObject {

  @objc public static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc public func getBottomSafeAreaInset(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      let bottom = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .first?
        .windows
        .first { $0.isKeyWindow }?
        .safeAreaInsets.bottom ?? 0
      resolve(bottom)
    }
  }

  @objc public func isFontAvailable(
    _ fontFamily: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // React Native accepts a family name or a font name, and maps these names to the system font.
    let systemNames: Set<String> = ["System", "system-ui", "ui-sans-serif", "ui-serif", "ui-rounded", "ui-monospace"]
    let available = systemNames.contains(fontFamily)
      || !UIFont.fontNames(forFamilyName: fontFamily).isEmpty
      || UIFont(name: fontFamily, size: UIFont.systemFontSize) != nil
    resolve(available)
  }
}
