package pt.isel

import pt.isel.activity.ActivityType
import pt.isel.cabinet.CabinetStatus
import pt.isel.user.UserStatus
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeParseException

/**
 * Parses a String into a [LocalTime], returning null when the value is not a valid time.
 */
fun String.toLocalTimeOrNull(): LocalTime? =
    try {
        LocalTime.parse(this)
    } catch (e: DateTimeParseException) {
        null
    }

fun String.toUserStatus(): UserStatus? =
    when (this) {
        "ACTIVE" -> UserStatus.ACTIVE
        "INACTIVE" -> UserStatus.INACTIVE
        else -> null
    }

fun CabinetStatus.toActivityType(): ActivityType =
    when (this) {
        CabinetStatus.BROKEN -> ActivityType.CABINET_BROKEN
        CabinetStatus.OPEN -> ActivityType.OPEN_CABINET
        CabinetStatus.INACTIVE -> ActivityType.CABINET_ANOMALY
        CabinetStatus.CLOSED -> ActivityType.CLOSE_CABINET
    }
