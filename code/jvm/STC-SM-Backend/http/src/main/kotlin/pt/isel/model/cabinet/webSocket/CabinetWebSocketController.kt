package pt.isel.model.cabinet.webSocket

import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.stereotype.Controller
import pt.isel.CabinetService
import pt.isel.model.cabinet.CabinetInputModel

@Controller
class CabinetWebSocketController(
    private val cabinetService: CabinetService
) {
    @MessageMapping("/cabinet/status")
    fun updateCabinetStatus(input : CabinetInputModel) {
        cabinetService.updateCabinet(input.status, input.cabinetId, input.userId)
    }
}