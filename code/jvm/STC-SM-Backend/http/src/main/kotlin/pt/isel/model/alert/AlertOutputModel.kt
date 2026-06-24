package pt.isel.model.alert

import pt.isel.alert.Alert
import java.time.Instant

data class AlertOutputModel(
    val id: Int,
    val type: String,
    val timestamp: Instant,
    val message: String,
    val status: String,
    val userName: String,
    val cabinetName: String?,
    val toolName: String?,
    val self: String,
) {
    companion object {
        fun fromDomain(alert: Alert): AlertOutputModel =
            AlertOutputModel(
                id = alert.id,
                type = alert.type.name,
                timestamp = alert.date,
                status = alert.status.name,
                userName = alert.user.name,
                cabinetName = alert.cabinet?.description,
                message = alert.message,
                toolName = alert.tool?.name,
                self = "/api/alerts/${alert.id}",
            )
    }
}
