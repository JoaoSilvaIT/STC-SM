package pt.isel.notification

import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import pt.isel.events.ToolUpdated
import pt.isel.model.tools.ToolOutputModel

@Component
class ToolNotificationListener(
    private val messagingTemplate: SimpMessagingTemplate,
) {
    @EventListener
    fun handleToolUpdated(event: ToolUpdated) {
        val toolDto = ToolOutputModel.fromDomain(event.tool)

        messagingTemplate.convertAndSend("/topic/tools", toolDto)
    }
}
