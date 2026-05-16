package pt.isel

import java.time.Instant
import java.time.format.DateTimeParseException

/**
 * Conversion from String to Instant
 */
fun String.toInstantOrNull(): Instant? {
    return try {
        Instant.parse(this)
    } catch (e: DateTimeParseException) {
        null
    }
}