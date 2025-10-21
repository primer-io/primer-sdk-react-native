import Danger
import Foundation

let danger = Danger()
let pr = danger.github.pullRequest
let isReleasePr = pr.head.ref.hasPrefix("release")
let allCreatedAndModifiedFiles = danger.git.modifiedFiles + danger.git.createdFiles
let sdkEditedFiles = allCreatedAndModifiedFiles
    .filter { $0.name != "Dangerfile.swift" }
    .filter { !$0.hasPrefix("example/") }
    .filter { !$0.contains("__tests__") }
    .filter { !$0.hasPrefix("ios/Tests/") }

// You can use these functions to send feedback:
// message("Highlight something in the table")
// warn("Something pretty bad, but not important enough to fail the build")
// fail("Something that must be changed")
// markdown("Free-form markdown that goes under the table, so you can do whatever.")

// MARK: - Copyright

// Checks whether new files have "Copyright / Created by" mentions

let swiftFilesWithCopyright = sdkEditedFiles.filter {
    $0.fileType == .swift &&
        danger.utils.readFile($0).contains("//  Created by")
}

// if swiftFilesWithCopyright.count > 0 {
//    let files = swiftFilesWithCopyright.joined(separator: ", ")
//    warn("In Danger we don't include copyright headers, found them in: \(files)")
// }

// MARK: - PR Contains Tests

// Check if any test files were modified in this PR

let swiftTestFilesContainChanges = allCreatedAndModifiedFiles.filter {
    $0.fileType == .swift &&
        ($0.contains("Tests/") || $0.contains("__tests__")) &&
        danger.utils.readFile($0).contains("import XCTest")
}

if swiftTestFilesContainChanges.isEmpty && !isReleasePr {
    warn("This PR doesn't seem to contain any updated Unit Test for Swift 🤔. Please consider double checking it 🙏")
}

// MARK: - SwiftLint

// Use a different path for SwiftLint

let filesToLint = sdkEditedFiles.filter { $0.fileType == .swift }
let violations = SwiftLint.lint(.files(filesToLint), inline: true, configFile: "ios/.swiftlint.yml")

if violations.isEmpty {
    message("✅ No SwiftLint violations found.")
} else {
    fail("🙁 Found **\(violations.count)** SwiftLint violations.")
}

// MARK: - Check Coverage

// Coverage.xcodeBuildCoverage(.derivedDataFolder("Build"),
//                            minimumCoverage: 30)
