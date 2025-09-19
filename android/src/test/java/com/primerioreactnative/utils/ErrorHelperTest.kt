package com.primerioreactnative.utils

import com.primerioreactnative.datamodels.ErrorTypeRN
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

internal class ErrorHelperTest {
    // Create a mock ErrorTypeRN instance
    private val errorType = ErrorTypeRN.InvalidVaultedPaymentMethodId

    @Test
    fun `errorTo should create PrimerErrorRN with correct properties`() {
        // Mock message
        val errorMessage = "This is an error message"

        // Call the infix function
        val primerError = errorType errorTo errorMessage

        // Verify the errorId and message are set correctly in the PrimerErrorRN object
        assertEquals(errorType.errorId, primerError.errorId)
        assertEquals(errorMessage, primerError.description)
    }
}
