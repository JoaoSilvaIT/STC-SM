package pt.isel

import org.springframework.scheduling.TaskScheduler
import org.springframework.stereotype.Service
import pt.isel.cabinet.Cabinet
import pt.isel.user.User
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ScheduledFuture
import java.time.Instant

@Service
class TimerService (
    private val taskScheduler : TaskScheduler,
    private val alertService: AlertService
){
    private val cabinetTimers = ConcurrentHashMap<Int, ScheduledFuture<*>>()

    fun startTimerForCabinet(user: User, cabinet: Cabinet) {
        // Por segurança, se já houver um timer a correr, cancelamos
       // cancelTimerForCabinet(cabinetId)

        val triggerTime = Instant.now().plus(Duration.ofMinutes(2))

        val futureTimer = taskScheduler.schedule({
            // Lançar o Alerta daqui a triggerTime (10 minutos)
            alertService.createCabinetLeftOpenAlert(cabinet, user)
            // Após o alerta removemos o timer
            cabinetTimers.remove(cabinet.id)
        }, triggerTime)

        // Guardamos o timer para depois ser cancelado no futuro
        cabinetTimers[cabinet.id] = futureTimer
    }

    fun cancelTimerForCabinet(cabinetId: Int) {
        val existingTimer = cabinetTimers[cabinetId]
        if (existingTimer != null) {
            existingTimer.cancel(false)
            cabinetTimers.remove(cabinetId)
        }
    }
}