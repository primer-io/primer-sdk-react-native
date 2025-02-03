@file:DependsOn("xyz.pavelkorolev.danger.detekt:plugin:1.2.0")
import systems.danger.kotlin.*
import systems.danger.kotlin.models.github.*
import xyz.pavelkorolev.danger.detekt.DetektPlugin
import java.io.File

danger(args) {
    val allSourceFiles = git.modifiedFiles + git.createdFiles

    onGitHub {
        //region PR Contains Tests
        let kotlinFilesContainingChanges = allSourceFiles.filter {
            it.name.endswith(".kt") &&
                danger.utils.readFile(it).contains("import org.junit.jupiter.api.Test")
        }
        if (kotlinFilesContainingChanges.isEmpty()) {
            warn("This PR doesn't seem to contain any updated Unit Test for Kotlin 🤔. Please consider double checking it 🙏")
        }
        //endregion

        //region Detekt
        parseDetektReport()
        //endregion
    }
}

fun parseDetektReport() {
    val file = File("packages/sdk/android/build/reports/detekt/report.xml")
    if (!file.exists()) {
        warn("🙈 No detekt report found at ${file.path}")
        return
    }
    with(DetektPlugin) {
        val report = parse(file)
        val count = report.count
        if (count == 0) {
            message("👏👏👏 Good job! Detekt found no violations here!")
            return
        }
        fail(
            "🙁 Found **${report.count}** detekt violations."
        )
        report(report)
    }
}