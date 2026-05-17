package pt.isel.model.activity

import pt.isel.activity.Activity
import pt.isel.activity.ActivityType
import java.time.Instant

data class ActivityOutputModel(
    val type: String,
    val timestamp: Instant,
    val userName: String,
    val cabinetName: String?,
    val toolName: String?,
    val self: String,
    val user: String,
    val cabinet: String?,
    val tool: String?,
) {
    companion object {
        fun fromDomain(activity: Activity): ActivityOutputModel =
            ActivityOutputModel(
                type = mapType(activity.type),
                timestamp = activity.date,
                userName = activity.user.name,
                cabinetName = activity.cabinet?.description,
                toolName = activity.tool?.name,
                self = "/api/activities/${activity.id}",
                user = "/api/users/${activity.user.id}",
                cabinet = activity.cabinet?.let { "/api/cabinets/${it.id}" },
                tool = activity.tool?.let { "/api/tools/${it.id}" },
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
