package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.errors.ToolError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.tools.Tool
import pt.isel.tools.ToolStatus
import pt.isel.user.User
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class ToolServiceTest {
    private val toolRepo: ToolRepository = mockk(relaxed = true)
    private val cabinetRepo: CabinetRepository = mockk(relaxed = true)
    private val userRepo: UserRepository = mockk(relaxed = true)
    private val activityService: ActivityService = mockk(relaxed = true)
    private val eventPublisher: ApplicationEventPublisher = mockk(relaxed = true)
    private val service = ToolService(toolRepo, cabinetRepo, userRepo, activityService, eventPublisher)

    private val cabinet = Cabinet(id = 1, description = "C", status = CabinetStatus.OPEN, location = "loc")
    private val tool = Tool(id = 1, name = "Drill", cabinet = cabinet, status = ToolStatus.AVAILABLE, location = "loc")
    private val user =
        User(
            id = 1,
            name = "Joana",
            email = "j@x",
            profile = Profile(id = 1, role = Role.MECHANIC, description = ""),
            status = UserStatus.ACTIVE,
            passwordValidation = PasswordValidationInfo("h"),
        )

    @Test
    fun `getTool returns the tool when found`() {
        every { toolRepo.findByIdOrNull(1) } returns tool

        val result = service.getTool(1)

        assertIs<Either.Success<Tool>>(result)
        assertEquals(tool, result.value)
    }

    @Test
    fun `getTool returns ToolNotFound when missing`() {
        every { toolRepo.findByIdOrNull(99) } returns null

        val result = service.getTool(99)

        assertIs<Either.Failure<ToolError>>(result)
        assertEquals(ToolError.ToolNotFound, result.value)
    }

    @Test
    fun `updateTool changes status and saves`() {
        every { toolRepo.findByIdOrNull(1) } returns tool
        val saved = slot<Tool>()
        every { toolRepo.saveAndFlush(capture(saved)) } answers { firstArg() }
        every { userRepo.findByIdOrNull(1) } returns user

        val result = service.updateTool(1, ToolStatus.IN_USE, 1)

        assertIs<Either.Success<Tool>>(result)
        assertEquals(ToolStatus.IN_USE, saved.captured.status)
        assertEquals(tool.id, saved.captured.id)
    }

    @Test
    fun `updateTool returns ToolNotFound when missing`() {
        every { toolRepo.findByIdOrNull(99) } returns null

        val result = service.updateTool(99, ToolStatus.BROKEN, 1)

        assertIs<Either.Failure<ToolError>>(result)
        assertEquals(ToolError.ToolNotFound, result.value)
    }

    @Test
    fun `updateTool returns UserNotFound when the acting user is missing`() {
        every { toolRepo.findByIdOrNull(1) } returns tool
        every { toolRepo.saveAndFlush(any()) } answers { firstArg() }
        every { userRepo.findByIdOrNull(99) } returns null

        val result = service.updateTool(1, ToolStatus.IN_USE, 99)

        assertIs<Either.Failure<ToolError>>(result)
        assertEquals(ToolError.UserNotFound, result.value)
    }

    @Test
    fun `getAllTools returns repo contents`() {
        every { toolRepo.findAll() } returns listOf(tool)

        assertEquals(listOf(tool), service.getAllTools())
    }
}
