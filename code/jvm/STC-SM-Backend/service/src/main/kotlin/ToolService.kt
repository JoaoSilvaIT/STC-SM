import errors.ToolError
import jakarta.transaction.Transactional
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import tools.Tool
import tools.ToolStatus
import user.ToolRepository
import utils.Either
import utils.failure
import utils.success

@Component
class ToolService(private val toolRepo: ToolRepository) {

    fun getTool(tid: Int): Either<ToolError, Tool> {
        val tool = toolRepo.findByIdOrNull(tid)
        return if (tool != null) success(tool) else failure(ToolError.ToolNotFound)
    }

    @Transactional
    fun updateTool(tid: Int, status: ToolStatus): Either<ToolError, Tool> {
        val tool = toolRepo.findByIdOrNull(tid) ?: return failure(ToolError.ToolNotFound)
        return success(toolRepo.saveAndFlush(tool.copy(status = status)))
    }
}
