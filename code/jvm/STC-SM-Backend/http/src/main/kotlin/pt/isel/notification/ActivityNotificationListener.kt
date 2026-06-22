package pt.isel.notification

import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import pt.isel.events.ActivityNotification
import pt.isel.model.activity.ActivityOutputModel

@Component
class ActivityNotificationListener (
    private val messagingTemplate: SimpMessagingTemplate
){
    @EventListener
    fun handleActivityNotification(event: ActivityNotification) {
        val activityDto = ActivityOutputModel.fromDomain(event.activity)

        messagingTemplate.convertAndSend("/topic/activity", activityDto)
    }
}