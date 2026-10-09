package com.primerioreactnative.extensions

import com.primerioreactnative.datamodels.PrimerSettingsRN
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

internal class PrimerUIOptionsRNTest {
    private val json = Json { ignoreUnknownKeys = true }

    @ParameterizedTest(name = "{0}, system dark {1} -> {2}")
    @CsvSource(
        delimiter = '|',
        textBlock = """
            DARK   | true  | true
            DARK   | false | true
            LIGHT  | true  | false
            LIGHT  | false | false
            SYSTEM | true  | true
            SYSTEM | false | false
            dark   | true  | true
            dark   | false | false
            SEPIA  | true  | true
            SEPIA  | false | false
            ''     | true  | true
            ''     | false | false
                   | true  | true
                   | false | false""",
    )
    fun `DARK and LIGHT force the appearance, anything else follows the system`(
        appearanceMode: String?,
        orSystem: Boolean,
        expected: Boolean,
    ) {
        assertEquals(expected, isDarkAppearance(appearanceMode, orSystem))
    }

    @Test
    fun `appearanceMode decodes as sent and is null when absent`() {
        val dark = json.decodeFromString<PrimerSettingsRN>("""{"uiOptions":{"appearanceMode":"DARK"}}""")
        val absent = json.decodeFromString<PrimerSettingsRN>("""{"uiOptions":{}}""")

        assertEquals("DARK", dark.uiOptions.appearanceMode)
        assertNull(absent.uiOptions.appearanceMode)
    }
}
