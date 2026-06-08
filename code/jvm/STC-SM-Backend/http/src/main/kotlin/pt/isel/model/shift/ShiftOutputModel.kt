package pt.isel.model.shift

import pt.isel.shift.Shift
import java.time.Instant

data class ShiftOutputModel(
    val userName: String,
    val cabinetDescription: String,
    val startTime: String,
    val endTime: String,
    val status: String,
    val self: String,
    val user: String,
    val cabinet: String,
) {
    companion object {
        fun fromDomain(shift: Shift): ShiftOutputModel =
            ShiftOutputModel(
                userName = shift.user.name,
                cabinetDescription = shift.cabinet.description,
                startTime = shift.startTime.toString(),
                endTime = shift.endTime.toString(),
                status = shift.status.name,
                self = "/api/shifts/${shift.id}",
                user = "/api/users/${shift.user.id}",
                cabinet = "/api/cabinets/${shift.cabinet.id}",
            )
    }
}
