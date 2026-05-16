package pt.isel.model.shift

import pt.isel.shift.Shift

data class ShiftOutputModel(
    val userName : String,
    val cabinetDescription : String,
    val startTime : String,
    val endTime : String
) {
    companion object {
        fun fromDomain(shift: Shift): ShiftOutputModel =
            ShiftOutputModel(
                userName = shift.user.name,
                cabinetDescription = shift.cabinet.description,
                startTime = shift.startTime.toString(),
                endTime = shift.endTime.toString()
            )
    }
}
