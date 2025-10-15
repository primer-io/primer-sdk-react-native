@file:DependsOn("xyz.pavelkorolev.danger.detekt:plugin:1.2.0")

import java.io.File
import systems.danger.kotlin.*
import systems.danger.kotlin.models.github.*
import xyz.pavelkorolev.danger.detekt.DetektPlugin

register plugin DetektPlugin

danger(args) {
    val allSourceFiles = git.modifiedFiles + git.createdFiles
    val isReleasePr = github.pullRequest.head.ref.startsWith("release")

    onGitHub {
        // region PR Contains Tests
        val kotlinTestFilesContainingChanges =
                allSourceFiles.filter { path: String ->
                    path.endsWith(".kt") &&
                            (path.contains("test/") || path.contains("Test.kt") || path.contains("__tests__")) &&
                            File(path).readText().contains("import org.junit.jupiter.api.Test")
                }
        if (kotlinTestFilesContainingChanges.isEmpty() && !isReleasePr) {
            warn(
                "This PR doesn't seem to contain any updated Unit Test for Kotlin 🤔. Please consider double checking it 🙏"
            )
        }
        // endregion

        // region Detekt
        parseDetektReport()
        // endregion
    }
}

fun parseDetektReport() {
    val file = File("android/build/reports/detekt/detekt.xml")
    if (!file.exists()) {
        warn("🙈 No detekt report found at ${file.path}")
        return
    }
    with(DetektPlugin) {
        val report = parse(file)
        val count = report.count
        report(report)
        if (count == 0) {
            message("✅ No detekt violations found.")
        } else {
            fail("🙁 Found **${report.count}** detekt violations.")
        }
    }
}
