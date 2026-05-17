package pt.isel

import pt.isel.errors.ToolError
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.activity.ActivityType
import pt.isel.tools.Tool
import pt.isel.tools.ToolStatus
import pt.isel.user.User
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Instant

@Service
class ToolService(
    private val toolRepo: ToolRepository,
    private val cabinetRepo: CabinetRepository,
    private val activityService: ActivityService,
) {

    fun getTool(tid: Int): Either<ToolError, Tool> {
        val tool = toolRepo.findByIdOrNull(tid)
        return if (tool != null) success(tool) else failure(ToolError.ToolNotFound)
    }

    @Transactional
    fun createTool(name: String, cabinetId: Int, status: ToolStatus, location: String, actor: User? = null): Either<ToolError, Tool> {
        if (name.isBlank()) return failure(ToolError.InvalidName)
        if (location.isBlank()) return failure(ToolError.InvalidLocation)
        val cabinet = cabinetRepo.findByIdOrNull(cabinetId) ?: return failure(ToolError.InvalidCabinet)
        val tool = Tool(name = name, cabinet = cabinet, status = status, location = location)
        val saved = toolRepo.save(tool)
        if (actor != null) {
            activityService.createActivity(actor.id, saved.id, cabinet.id, ActivityType.RETURN_TOOL, Instant.now())
        }
        return success(saved)
    }

    @Transactional
    fun updateTool(tid: Int, status: ToolStatus, actor: User? = null): Either<ToolError, Tool> {
        val tool = toolRepo.findByIdOrNull(tid) ?: return failure(ToolError.ToolNotFound)
        val saved = toolRepo.saveAndFlush(tool.copy(status = status))
        if (actor != null) {
            val activityType = when (status) {
                ToolStatus.ACTIVE -> ActivityType.RETURN_TOOL
                ToolStatus.BROKEN -> ActivityType.REMOVE_TOOL
                ToolStatus.REPAIRING -> ActivityType.TOOL_BROKEN
            }
            activityService.createActivity(actor.id, saved.id, tool.cabinet.id, activityType, Instant.now())
        }
        return success(saved)
    }

    fun getAllTools(): List<Tool> = toolRepo.findAll()
}
