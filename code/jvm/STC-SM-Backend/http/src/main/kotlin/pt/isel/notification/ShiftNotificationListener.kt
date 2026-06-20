package pt.isel.notification

import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import pt.isel.events.ShiftStartedEvent
import pt.isel.model.alert.AlertOutputModel
import pt.isel.model.shift.ShiftOutputModel

@Component
class ShiftNotificationListener(
    private val messagingTemplate: SimpMessagingTemplate
) {
    @EventListener
    fun handleShiftStarted(event: ShiftStartedEvent) {
        val shiftDto = ShiftOutputModel.fromDomain(event.shift)

        if (event.alert != null) {
            val alertDto = AlertOutputModel.fromDomain(event.alert!!)
            messagingTemplate.convertAndSend("/topic/alertas", alertDto)
        }

        messagingTemplate.convertAndSend("/topic/shifts", shiftDto)
    }
}