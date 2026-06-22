package pt.isel.model.tools.webSocket

import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.stereotype.Controller
import pt.isel.ToolService
import pt.isel.model.tools.ToolInputModel

@Controller
class ToolWebSocketController(
    private val toolService: ToolService,
) {
    @MessageMapping("/tool/status")
    fun updateToolStatus(input : ToolInputModel) {
        toolService.updateTool(input.toolId, input.status, input.userId)
    }
}