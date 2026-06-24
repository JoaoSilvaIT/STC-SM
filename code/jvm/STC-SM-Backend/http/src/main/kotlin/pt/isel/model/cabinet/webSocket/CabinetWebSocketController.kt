package pt.isel.model.cabinet.webSocket

import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.stereotype.Controller
import pt.isel.CabinetService
import pt.isel.model.cabinet.CabinetInputModel
import pt.isel.utils.Either

@Controller
class CabinetWebSocketController(
    private val cabinetService: CabinetService,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @MessageMapping("/cabinet/status")
    fun updateCabinetStatus(input: CabinetInputModel) {
        val result = cabinetService.updateCabinet(input.status, input.cabinetId, input.userId)
        if (result is Either.Failure) {
            logger.warn("Failed to update cabinet {} status to {}: {}", input.cabinetId, input.status, result.value)
        }
    }
}
