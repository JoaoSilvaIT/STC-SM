package pt.isel.events

import pt.isel.alert.Alert
import pt.isel.shift.Shift

data class ShiftUpdated(
    val shift: Shift,
    val alert: Alert?,
)
