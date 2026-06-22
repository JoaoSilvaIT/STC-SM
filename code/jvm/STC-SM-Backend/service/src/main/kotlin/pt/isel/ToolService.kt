package pt.isel

import org.springframework.context.ApplicationEventPublisher
import pt.isel.errors.ToolError
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.activity.ActivityType
import pt.isel.events.ToolUpdated
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
    private val userRepo : UserRepository,
    private val activityService: ActivityService,
    private val eventPublisher: ApplicationEventPublisher
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
            activityService.createActivity(actor.id, saved.id, cabinet.id, null,ActivityType.RETURN_TOOL, Instant.now())
        }
        return success(saved)
    }

    @Transactional
    fun updateTool(tid: Int, status: ToolStatus, uid: Int): Either<ToolError, Tool> {
        val tool = toolRepo.findByIdOrNull(tid) ?: return failure(ToolError.ToolNotFound)
        val saved = toolRepo.saveAndFlush(tool.copy(status = status))
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ToolError.UserNotFound)
        val activityType = when (status) {
            ToolStatus.AVAILABLE -> ActivityType.RETURN_TOOL
            ToolStatus.IN_USE -> ActivityType.REMOVE_TOOL
            ToolStatus.BROKEN -> ActivityType.TOOL_BROKEN
            ToolStatus.MISSING -> ActivityType.TOOL_MISSING
            ToolStatus.IN_MAINTENANCE -> ActivityType.TOOL_IN_MAINTENANCE
        }
        activityService.createActivity(user.id, saved.id, tool.cabinet.id, null,activityType, Instant.now())

        eventPublisher.publishEvent(ToolUpdated(saved))

        return success(saved)
    }

    fun getAllTools(): List<Tool> = toolRepo.findAll()
}
