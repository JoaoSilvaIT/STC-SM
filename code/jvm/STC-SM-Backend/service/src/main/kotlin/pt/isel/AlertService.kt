package pt.isel

import org.springframework.transaction.annotation.Transactional
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pt.isel.alert.Alert
import pt.isel.alert.AlertStatus
import pt.isel.alert.AlertType
import pt.isel.errors.AlertError
import pt.isel.shift.Shift
import pt.isel.user.User
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Duration
import java.time.Instant

@Service
class AlertService (private val alertRepo: AlertRepository) {
    fun evaluateLateStart(shift: Shift, user: User) {
        val currentTime = Instant.now()
        val delayMinutes = Duration.between(shift.startTime, currentTime).toMinutes()

        if (delayMinutes >= 1) {
            val alert = Alert(
                type = AlertType.LATE_START,
                date = currentTime,
                status = AlertStatus.UNREAD,
                message = "Mechanic ${user.name} started shift ${delayMinutes}m late.",
                user = user,
                shift = shift
            )
            alertRepo.save(alert)
        }
    }

    fun getUnreadAlerts(): Either<AlertError, List<Alert>> {
        val alerts = alertRepo.findByType(AlertType.LATE_START)
        val unreadAlerts = alerts.filter { it.status == AlertStatus.UNREAD }
        return success(unreadAlerts)
    }

    @Transactional
    fun markAsReadAlert(aid: Int): Either<AlertError, Alert> {
        val alert = alertRepo.findByIdOrNull(aid) ?: return failure(AlertError.AlertNotFound)
        val newAlert = alert.copy(status = AlertStatus.READ)
        return success(alertRepo.save(newAlert))
    }

}