package pt.isel

import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.alert.Alert
import pt.isel.alert.AlertStatus
import pt.isel.alert.AlertType
import pt.isel.cabinet.Cabinet
import pt.isel.errors.AlertError
import pt.isel.events.AlertNotification
import pt.isel.shift.Shift
import pt.isel.user.User
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Duration
import java.time.Instant
import java.time.LocalTime

@Service
class AlertService(
    private val alertRepo: AlertRepository,
    private val cabinetRepo: CabinetRepository,
    private val eventPublisher: ApplicationEventPublisher,
) {
    fun evaluateLateStart(
        shift: Shift,
        user: User,
    ): Alert? {
        val currentTime = LocalTime.now()
        val delayMinutes = Duration.between(shift.startTime, currentTime).toMinutes()

        val date = Instant.now()

        if (delayMinutes >= LATE_START_THRESHOLD_MINUTES) {
            val alert =
                Alert(
                    type = AlertType.LATE_START,
                    date = date,
                    status = AlertStatus.UNREAD,
                    message = "Mechanic ${user.name} started shift ${delayMinutes}m late.",
                    user = user,
                    shift = shift,
                )
            return alertRepo.save(alert)
        }

        return null
    }

    fun evaluateEarlyEnding(
        shift: Shift,
        user: User,
    ): Alert? {
        val currentTime = LocalTime.now()

        val earlyMinutes = Duration.between(currentTime, shift.endTime).toMinutes()

        val date = Instant.now()

        if (earlyMinutes >= EARLY_ENDING_THRESHOLD_MINUTES) {
            val alert =
                Alert(
                    type = AlertType.EARLY_ENDING,
                    date = date,
                    status = AlertStatus.UNREAD,
                    message = "Mechanic ${user.name} ended shift ${earlyMinutes}m early.",
                    user = user,
                    shift = shift,
                )
            return alertRepo.save(alert)
        }

        return null
    }

    fun getUnreadAlerts(): List<Alert> = alertRepo.findByStatus(AlertStatus.UNREAD)

    @Transactional
    fun markAsReadAlert(aid: Int): Either<AlertError, Alert> {
        val alert = alertRepo.findByIdOrNull(aid) ?: return failure(AlertError.AlertNotFound)
        val newAlert = alert.copy(status = AlertStatus.READ)
        return success(alertRepo.save(newAlert))
    }

    fun createCabinetLeftOpenAlert(
        cabinet: Cabinet,
        user: User,
    ): Either<AlertError, Alert> {
        val date = Instant.now()
        val alert =
            Alert(
                date = date,
                type = AlertType.OPEN_CABINET,
                status = AlertStatus.UNREAD,
                message = "Cabinet ${cabinet.description} left open by mechanic ${user.name}.",
                cabinet = cabinet,
                user = user,
            )
        alertRepo.save(alert)
        eventPublisher.publishEvent(AlertNotification(alert))
        return success(alert)
    }

    companion object {
        // Grace period before a late clock-in raises a LATE_START alert.
        private const val LATE_START_THRESHOLD_MINUTES = 20L

        // Grace period before an early clock-off raises an EARLY_ENDING alert.
        private const val EARLY_ENDING_THRESHOLD_MINUTES = 13L
    }
}
