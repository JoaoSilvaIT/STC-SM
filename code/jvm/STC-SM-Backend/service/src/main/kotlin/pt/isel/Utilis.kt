package pt.isel

import pt.isel.user.UserStatus
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

fun String.toUserStatus(): UserStatus? {
    return when(this) {
        "ACTIVE" -> UserStatus.ACTIVE
        "INACTIVE" -> UserStatus.INACTIVE
        else -> null
    }
}
