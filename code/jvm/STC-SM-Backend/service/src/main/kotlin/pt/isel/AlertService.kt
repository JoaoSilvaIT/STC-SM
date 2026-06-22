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
class AlertService (
    private val alertRepo: AlertRepository,
) {
    fun evaluateLateStart(shift: Shift, user: User): Alert? {
        val currentTime = Instant.now()
        val delayMinutes = Duration.between(shift.startTime, currentTime).toMinutes()

        if (delayMinutes >= 20) {
            val alert = Alert(
                type = AlertType.LATE_START,
                date = currentTime,
                status = AlertStatus.UNREAD,
                message = "Mechanic ${user.name} started shift ${delayMinutes}m late.",
                user = user,
                shift = shift
            )
            return alertRepo.save(alert)
        }

        return null
    }

    fun evaluateEarlyEnding(shift: Shift, user: User): Alert? {
        val currentTime = Instant.now()

        val earlyMinutes = Duration.between(currentTime, shift.endTime).toMinutes()

        if (earlyMinutes >= 13) {
            val alert = Alert(
                type = AlertType.EARLY_ENDING,
                date = currentTime,
                status = AlertStatus.UNREAD,
                message = "Mechanic ${user.name} ended shift ${earlyMinutes}m early.",
                user = user,
                shift = shift
            )
            return alertRepo.save(alert)
        }

        return null
    }

    fun getUnreadAlerts(): Either<AlertError, List<Alert>> {
        val alerts = alertRepo.findAll()
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