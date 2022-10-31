//
//  UIImage+Extensions.swift
//  primer-io-react-native
//
//  Created by Evangelos on 6/10/22.
//

import UIKit

extension UIImage {
    
    func store(withName name: String) throws -> URL {
        guard let imageURL = NSURL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("\(name).png") else {
<<<<<<< HEAD
            let err = RNTNativeError(errorId: "error", errorDescription: "Failed to create URL for asset", recoverySuggestion: nil)
=======
            let err = RNTNativeError(
                errorId: "native-ios",
                errorDescription: "Failed to create URL for asset",
                recoverySuggestion: nil)
>>>>>>> feature/DEVX-409_HUC-Example-app
            throw err
        }

        guard let pngData = self.pngData() else {
<<<<<<< HEAD
            let err = RNTNativeError(errorId: "error", errorDescription: "Failed to get image's PNG data", recoverySuggestion: nil)
=======
            let err = RNTNativeError(
                errorId: "native-ios",
                errorDescription: "Failed to get image's PNG data",
                recoverySuggestion: nil)
>>>>>>> feature/DEVX-409_HUC-Example-app
            throw err
        }

        try pngData.write(to: imageURL)
        return imageURL
    }
}
