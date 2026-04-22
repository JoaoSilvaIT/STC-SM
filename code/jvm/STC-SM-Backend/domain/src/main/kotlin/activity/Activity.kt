package activity

import java.util.Date

data class Activity(
    val id: Int,
    val type: ActivityType,
    val date: Date,
    val idUser: Int,
    val idTool: Int,
    val idCabinet: Int
)
