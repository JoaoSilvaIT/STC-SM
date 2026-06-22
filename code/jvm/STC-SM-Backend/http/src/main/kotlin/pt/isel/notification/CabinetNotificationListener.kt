package pt.isel.notification

import org.springframework.context.event.EventListener
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component
import pt.isel.events.CabinetUpdated
import pt.isel.model.cabinet.CabinetOutputModel

@Component
class CabinetNotificationListener(
    private val messagingTemplate: SimpMessagingTemplate
) {
    @EventListener
    fun handleCabinetUpdated(event: CabinetUpdated) {
        val cabinetDto = CabinetOutputModel.fromDomain(event.cabinet)

        messagingTemplate.convertAndSend("/topic/cabinets", cabinetDto)
    }
}