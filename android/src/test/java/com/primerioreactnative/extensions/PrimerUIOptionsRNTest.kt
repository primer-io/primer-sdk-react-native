package com.primerioreactnative.extensions

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

internal class PrimerUIOptionsRNTest {
    @ParameterizedTest(name = "{0}, system dark {1} -> {2}")
    @CsvSource(
        delimiter = '|',
        textBlock = """
            DARK   | false | true
            LIGHT  | true  | false
            SYSTEM | true  | true
            SYSTEM | false | false""",
    )
    fun `DARK and LIGHT force the appearance, anything else follows the system`(
        appearanceMode: String?,
        orSystem: Boolean,
        expected: Boolean,
    ) {
        assertEquals(expected, isDarkAppearance(appearanceMode, orSystem))
    }
}
