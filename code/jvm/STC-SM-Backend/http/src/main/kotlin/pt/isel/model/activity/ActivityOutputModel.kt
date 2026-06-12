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
            ActivityType.OPEN_CABINET -> "OPEN_CABINET"
            ActivityType.CLOSE_CABINET -> "CLOSE_CABINET"
            ActivityType.REMOVE_TOOL -> "REMOVE_TOOL"
            ActivityType.RETURN_TOOL -> "RETURN_TOOL"
            ActivityType.TOOL_BROKEN -> "TOOL_BROKEN"
            ActivityType.CABINET_ANOMALY -> "CABINET_ANOMALY"
            ActivityType.STARTED_SHIFT -> "STARTED_SHIFT"
            ActivityType.ENDED_SHIFT -> "ENDED_SHIFT"
            ActivityType.TOOL_MISSING -> "TOOL_MISSING"
            ActivityType.TOOL_IN_MAINTENANCE -> "TOOL_IN_MAINTENANCE"
        }
    }
}
