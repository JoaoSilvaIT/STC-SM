package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.springframework.data.repository.findByIdOrNull
import pt.isel.activity.Activity
import pt.isel.activity.ActivityType
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.errors.ActivityError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.tools.Tool
import pt.isel.tools.ToolStatus
import pt.isel.user.User
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull

class ActivityServiceTest {

    private val activityRepo: ActivityRepository = mockk(relaxed = true)
    private val userRepo: UserRepository = mockk()
    private val cabinetRepo: CabinetRepository = mockk()
    private val toolRepo: ToolRepository = mockk()
    private val service = ActivityService(activityRepo, userRepo, cabinetRepo, toolRepo)

    private val profile = Profile(id = 1, role = Role.MECHANIC, description = "")
    private val user = User(
        id = 1, name = "Joana", email = "j@x", profile = profile,
        status = UserStatus.ACTIVE, passwordValidation = PasswordValidationInfo("h"),
    )
    private val cabinet = Cabinet(id = 1, description = "C", status = CabinetStatus.OPEN, location = "loc")
    private val tool = Tool(id = 1, name = "Drill", cabinet = cabinet, status = ToolStatus.ACTIVE, location = "loc")
    private val date: Instant = Instant.parse("2026-01-01T10:00:00Z")

    @Test
    fun `getAllActivities delegates to repo`() {
        val activities = listOf(
            Activity(id = 1, type = ActivityType.OPEN_CABINET, date = date, user = user),
            Activity(id = 2, type = ActivityType.REMOVE_TOOL, date = date, user = user, tool = tool),
        )
        every { activityRepo.findAll() } returns activities

        val result = service.getAllActivities()

        assertEquals(activities, result)
    }

    @Test
    fun `getActivity returns the activity when found`() {
        val activity = Activity(id = 5, type = ActivityType.OPEN_CABINET, date = date, user = user)
        every { activityRepo.findByIdOrNull(5) } returns activity

        val result = service.getActivity(5)

        assertIs<Either.Success<Activity>>(result)
        assertEquals(activity, result.value)
    }

    @Test
    fun `getActivity returns ActivityNotFound when missing`() {
        every { activityRepo.findByIdOrNull(99) } returns null

        val result = service.getActivity(99)

        assertIs<Either.Failure<ActivityError>>(result)
        assertEquals(ActivityError.ActivityNotFound, result.value)
    }

    @Test
    fun `getActivityByTool delegates to repo`() {
        val activities = listOf(Activity(type = ActivityType.REMOVE_TOOL, date = date, user = user, tool = tool))
        every { activityRepo.findByToolId(1) } returns activities

        val result = service.getActivitiesByTool(1)

        assertIs<Either.Success<List<Activity>>>(result)
        assertEquals(activities, result.value)
    }

    @Test
    fun `getActivityByUser delegates to repo`() {
        every { activityRepo.findByUserId(1) } returns emptyList()

        val result = service.getActivitiesByUser(1)

        assertIs<Either.Success<List<Activity>>>(result)
        assertEquals(emptyList(), result.value)
    }

    @Test
    fun `getActivityByCabinet delegates to repo`() {
        every { activityRepo.findByCabinetId(1) } returns emptyList()

        val result = service.getActivitiesByCabinet(1)

        assertIs<Either.Success<List<Activity>>>(result)
        assertEquals(emptyList(), result.value)
    }

    @Test
    fun `createActivity fails when user id invalid`() {
        every { userRepo.findByIdOrNull(99) } returns null

        val result = service.createActivity(99, null, null, ActivityType.OPEN_CABINET, date)

        assertIs<Either.Failure<ActivityError>>(result)
        assertEquals(ActivityError.InvalidUserId, result.value)
    }

    @Test
    fun `createActivity fails when tool id invalid`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { toolRepo.findByIdOrNull(99) } returns null

        val result = service.createActivity(1, 99, null, ActivityType.REMOVE_TOOL, date)

        assertIs<Either.Failure<ActivityError>>(result)
        assertEquals(ActivityError.InvalidToolId, result.value)
    }

    @Test
    fun `createActivity fails when cabinet id invalid`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { cabinetRepo.findByIdOrNull(99) } returns null

        val result = service.createActivity(1, null, 99, ActivityType.OPEN_CABINET, date)

        assertIs<Either.Failure<ActivityError>>(result)
        assertEquals(ActivityError.InvalidCabinetId, result.value)
    }

    @Test
    fun `createActivity persists with only the user when tool and cabinet are null`() {
        every { userRepo.findByIdOrNull(1) } returns user
        val saved = slot<Activity>()
        every { activityRepo.save(capture(saved)) } answers { firstArg() }

        val result = service.createActivity(1, null, null, ActivityType.OPEN_CABINET, date)

        assertIs<Either.Success<Activity>>(result)
        assertEquals(user, saved.captured.user)
        assertNull(saved.captured.tool)
        assertNull(saved.captured.cabinet)
    }

    @Test
    fun `createActivity persists with tool and cabinet when provided`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { toolRepo.findByIdOrNull(1) } returns tool
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet
        val saved = slot<Activity>()
        every { activityRepo.save(capture(saved)) } answers { firstArg() }

        val result = service.createActivity(1, 1, 1, ActivityType.REMOVE_TOOL, date)

        assertIs<Either.Success<Activity>>(result)
        assertEquals(tool, saved.captured.tool)
        assertEquals(cabinet, saved.captured.cabinet)
        assertEquals(ActivityType.REMOVE_TOOL, saved.captured.type)
    }
}
