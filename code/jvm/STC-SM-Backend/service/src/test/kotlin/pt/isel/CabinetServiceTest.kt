package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.errors.CabinetError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.user.User
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class CabinetServiceTest {
    private val cabinetRepo: CabinetRepository = mockk(relaxed = true)
    private val userRepo: UserRepository = mockk(relaxed = true)
    private val activityService: ActivityService = mockk(relaxed = true)
    private val timerService: TimerService = mockk(relaxed = true)
    private val eventPublisher: ApplicationEventPublisher = mockk(relaxed = true)
    private val service = CabinetService(cabinetRepo, userRepo, activityService, timerService, eventPublisher)

    private val cabinet = Cabinet(id = 1, description = "C", status = CabinetStatus.OPEN, location = "loc")
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
    fun `getCabinet returns the cabinet when found`() {
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet

        val result = service.getCabinet(1)

        assertIs<Either.Success<Cabinet>>(result)
        assertEquals(cabinet, result.value)
    }

    @Test
    fun `getCabinet returns CabinetNotFound when missing`() {
        every { cabinetRepo.findByIdOrNull(99) } returns null

        val result = service.getCabinet(99)

        assertIs<Either.Failure<CabinetError>>(result)
        assertEquals(CabinetError.CabinetNotFound, result.value)
    }

    @Test
    fun `updateCabinet changes status and saves`() {
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet
        every { userRepo.findByIdOrNull(1) } returns user
        val saved = slot<Cabinet>()
        every { cabinetRepo.saveAndFlush(capture(saved)) } answers { firstArg() }

        val result = service.updateCabinet(CabinetStatus.CLOSED, 1, 1)

        assertIs<Either.Success<Cabinet>>(result)
        assertEquals(CabinetStatus.CLOSED, saved.captured.status)
        assertEquals(cabinet.id, saved.captured.id)
    }

    @Test
    fun `updateCabinet returns CabinetNotFound when missing`() {
        every { cabinetRepo.findByIdOrNull(99) } returns null

        val result = service.updateCabinet(CabinetStatus.CLOSED, 99, 1)

        assertIs<Either.Failure<CabinetError>>(result)
        assertEquals(CabinetError.CabinetNotFound, result.value)
    }

    @Test
    fun `updateCabinet returns UserNotFound when the acting user is missing`() {
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet
        every { userRepo.findByIdOrNull(99) } returns null

        val result = service.updateCabinet(CabinetStatus.CLOSED, 1, 99)

        assertIs<Either.Failure<CabinetError>>(result)
        assertEquals(CabinetError.UserNotFound, result.value)
    }

    @Test
    fun `createCabinet fails on blank description`() {
        val result = service.createCabinet(" ", CabinetStatus.CLOSED, "loc")

        assertIs<Either.Failure<CabinetError>>(result)
        assertEquals(CabinetError.InvalidDescription, result.value)
    }

    @Test
    fun `createCabinet fails on blank location`() {
        val result = service.createCabinet("desc", CabinetStatus.CLOSED, "  ")

        assertIs<Either.Failure<CabinetError>>(result)
        assertEquals(CabinetError.InvalidLocation, result.value)
    }

    @Test
    fun `createCabinet persists when inputs are valid`() {
        val saved = slot<Cabinet>()
        every { cabinetRepo.save(capture(saved)) } answers { firstArg() }

        val result = service.createCabinet("White Cabinet", CabinetStatus.CLOSED, "Sector 2")

        assertIs<Either.Success<Cabinet>>(result)
        assertEquals("White Cabinet", saved.captured.description)
        assertEquals("Sector 2", saved.captured.location)
        assertEquals(CabinetStatus.CLOSED, saved.captured.status)
    }
}
