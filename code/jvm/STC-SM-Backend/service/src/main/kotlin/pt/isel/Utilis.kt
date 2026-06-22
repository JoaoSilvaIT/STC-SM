package pt.isel

import pt.isel.activity.ActivityType
import pt.isel.cabinet.CabinetStatus
import pt.isel.user.UserStatus
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeParseException

/**
 * Conversion from String to LocalDate
 */
fun String.toLocalTimeOrNull(): LocalTime? {
    return try {
        LocalTime.parse(this)
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

fun CabinetStatus.toActivityType(): ActivityType {
    return when(this) {
        CabinetStatus.BROKEN -> ActivityType.CABINET_BROKEN
        CabinetStatus.OPEN -> ActivityType.OPEN_CABINET
        CabinetStatus.INACTIVE -> ActivityType.CABINET_ANOMALY
        CabinetStatus.CLOSED -> ActivityType.CLOSE_CABINET
    }
}