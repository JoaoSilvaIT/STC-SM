package activity

import java.time.Instant

data class Activity(
    val id: Int,
    val type: ActivityType,
    val date: Instant,
    val idUser: Int,
    val idTool: Int,
    val idCabinet: Int
)
