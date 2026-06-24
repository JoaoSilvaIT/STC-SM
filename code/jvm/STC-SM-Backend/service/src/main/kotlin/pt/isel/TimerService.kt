package pt.isel

import org.springframework.scheduling.TaskScheduler
import org.springframework.stereotype.Service
import pt.isel.cabinet.Cabinet
import pt.isel.user.User
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ScheduledFuture

@Service
class TimerService(
    private val taskScheduler: TaskScheduler,
    private val alertService: AlertService,
) {
    private val cabinetTimers = ConcurrentHashMap<Int, ScheduledFuture<*>>()

    fun startTimerForCabinet(
        user: User,
        cabinet: Cabinet,
    ) {
        // Cancel any timer already running for this cabinet so it is not orphaned.
        cancelTimerForCabinet(cabinet.id)

        val triggerTime = Instant.now().plus(CABINET_OPEN_ALERT_DELAY)

        val futureTimer =
            taskScheduler.schedule({
                alertService.createCabinetLeftOpenAlert(cabinet, user)
                cabinetTimers.remove(cabinet.id)
            }, triggerTime)

        cabinetTimers[cabinet.id] = futureTimer
    }

    fun cancelTimerForCabinet(cabinetId: Int) {
        val existingTimer = cabinetTimers[cabinetId]
        if (existingTimer != null) {
            existingTimer.cancel(false)
            cabinetTimers.remove(cabinetId)
        }
    }

    companion object {
        // How long a cabinet may stay open before a "left open" alert is raised.
        private val CABINET_OPEN_ALERT_DELAY: Duration = Duration.ofMinutes(2)
    }
}
