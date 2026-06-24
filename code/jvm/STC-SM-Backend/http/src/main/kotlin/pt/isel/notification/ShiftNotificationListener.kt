package pt.isel.notification

import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import pt.isel.events.ShiftUpdated
import pt.isel.model.alert.AlertOutputModel
import pt.isel.model.shift.ShiftOutputModel

@Component
class ShiftNotificationListener(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    @EventListener
    fun handleShiftStarted(event: ShiftUpdated) {
        val shiftDto = ShiftOutputModel.fromDomain(event.shift)

        val alert = event.alert
        if (alert != null) {
            val alertDto = AlertOutputModel.fromDomain(alert)
            messagingTemplate.convertAndSend("/topic/alerts", alertDto)
        }

        messagingTemplate.convertAndSend("/topic/shifts", shiftDto)
    }
}
