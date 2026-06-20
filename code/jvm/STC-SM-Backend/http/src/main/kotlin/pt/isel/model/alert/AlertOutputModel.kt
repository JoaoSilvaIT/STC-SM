package pt.isel.model.alert

import pt.isel.alert.Alert
import pt.isel.alert.AlertStatus
import pt.isel.alert.AlertType
import java.time.Instant

data class AlertOutputModel (
    val id: Int,
    val type: String,
    val timestamp: Instant,
    val message: String,
    val status: String,
    val userName: String,
    val cabinetName: String?,
    val toolName: String?,
    val self : String
){
    companion object {
        fun fromDomain(alert: Alert): AlertOutputModel =
            AlertOutputModel(
                id = alert.id,
                type = mapType(alert.type),
                timestamp = alert.date,
                status = mapStatus(alert.status),
                userName = alert.user.name,
                cabinetName = alert.cabinet?.description,
                message = alert.message,
                toolName = alert.tool?.name,
                self = "/api/alerts/${alert.id}"
            )

        private fun mapType(type: AlertType): String = when(type) {
            AlertType.LATE_START -> "LATE_START"
        }

        private fun mapStatus(status: AlertStatus): String = when(status) {
            AlertStatus.UNREAD -> "UNREAD"
            AlertStatus.READ -> "READ"
        }
    }
}
