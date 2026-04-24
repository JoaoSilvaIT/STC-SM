package shift

import java.time.Instant

data class Shift(
    val id : Int,
    val idCabinet: Int,
    val idUser: Int,
    val startTime: Instant,
    val endTime: Instant,
)
