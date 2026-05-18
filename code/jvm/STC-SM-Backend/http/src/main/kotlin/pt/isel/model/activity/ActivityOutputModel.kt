package pt.isel.model.activity

import pt.isel.activity.Activity
import pt.isel.activity.ActivityType
import java.time.Instant

data class ActivityOutputModel(
    val id: Int,
    val type: String,
    val timestamp: Instant,
    val userName: String,
    val cabinetName: String?,
    val toolName: String?,
) {
    companion object {
        fun fromDomain(activity: Activity): ActivityOutputModel =
            ActivityOutputModel(
                id = activity.id,
                type = mapType(activity.type),
                timestamp = activity.date,
                userName = activity.user.name,
                cabinetName = activity.cabinet?.description,
                toolName = activity.tool?.name,
            )

        private fun mapType(type: ActivityType): String = when (type) {
            ActivityType.OPEN_CABINET -> "DOOR_OPENED"
            ActivityType.CLOSE_CABINET -> "DOOR_CLOSED"
            ActivityType.REMOVE_TOOL -> "TOOL_REMOVED"
            ActivityType.RETURN_TOOL -> "TOOL_RETURNED"
            ActivityType.TOOL_BROKEN -> "TOOL_MISSING_DETECTED"
            ActivityType.CABINET_ANOMALY -> "CABINET_OFFLINE"
        }
    }
}
