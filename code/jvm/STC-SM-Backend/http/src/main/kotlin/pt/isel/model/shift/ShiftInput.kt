package pt.isel.model.shift

data class ShiftInput(
    val uid: Int,
    val cid: Int,
    val startTime: String,
    val endTime: String,
)
