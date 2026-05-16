package pt.isel

import pt.isel.errors.ToolError
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.tools.Tool
import pt.isel.tools.ToolStatus
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success

@Service
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

    fun getAllTools(): List<Tool> = toolRepo.findAll()
}
