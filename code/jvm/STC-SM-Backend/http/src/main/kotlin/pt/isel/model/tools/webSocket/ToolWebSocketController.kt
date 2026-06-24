package pt.isel.model.tools.webSocket

import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.stereotype.Controller
import pt.isel.ToolService
import pt.isel.model.tools.ToolInputModel
import pt.isel.utils.Either

@Controller
class ToolWebSocketController(
    private val toolService: ToolService,
) {
    private val logger = LoggerFactory.getLogger(javaClass)

    @MessageMapping("/tool/status")
    fun updateToolStatus(input: ToolInputModel) {
        val result = toolService.updateTool(input.toolId, input.status, input.userId)
        if (result is Either.Failure) {
            logger.warn("Failed to update tool {} status to {}: {}", input.toolId, input.status, result.value)
        }
    }
}
