package pt.isel.results

import pt.isel.alert.Alert
import pt.isel.shift.Shift

data class ShiftResult(
    val shift: Shift,
    val alert: Alert?,
)
