package shift

import java.time.Duration

data class Shift(
    val id : Int,
    val idCabinet: Int,
    val idUser: Int,
    val startTime: Duration,
    val endTime: Duration,
)
