package pt.isel.notification

import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import pt.isel.events.AlertNotification
import pt.isel.model.alert.AlertOutputModel

@Component
class AlertNotificationListener(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    @EventListener
    fun handleAlert(event: AlertNotification) {
        val alertDto = AlertOutputModel.fromDomain(event.alert)
        messagingTemplate.convertAndSend("/topic/alerts", alertDto)
    }
}
