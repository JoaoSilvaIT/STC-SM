package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.errors.ShiftError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.shift.Shift
import pt.isel.shift.ShiftStatus
import pt.isel.user.User
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import java.time.LocalDate
import java.time.LocalTime
import java.util.Optional
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class ShiftServiceTest {
    private val shiftRepo: ShiftRepository = mockk(relaxed = true)
    private val userRepo: UserRepository = mockk()
    private val cabinetRepo: CabinetRepository = mockk()
    private val alertService: AlertService = mockk(relaxed = true)
    private val activityService: ActivityService = mockk(relaxed = true)
    private val eventPublisher: ApplicationEventPublisher = mockk(relaxed = true)
    private val service = ShiftService(shiftRepo, userRepo, cabinetRepo, alertService, activityService, eventPublisher)

    private val profile = Profile(id = 1, role = Role.MECHANIC, description = "")
    private val user =
        User(
            id = 1,
            name = "Joana",
            email = "j@x",
            profile = profile,
            status = UserStatus.ACTIVE,
            passwordValidation = PasswordValidationInfo("h"),
        )
    private val backOffice =
        User(
            id = 2,
            name = "Bruno",
            email = "b@x",
            profile = Profile(id = 2, role = Role.BACK_OFFICE, description = ""),
            status = UserStatus.ACTIVE,
            passwordValidation = PasswordValidationInfo("h"),
        )
    private val cabinet = Cabinet(id = 1, description = "C", status = CabinetStatus.OPEN, location = "loc")
    private val startStr = "08:00"
    private val endStr = "16:00"
    private val start: LocalTime = LocalTime.parse(startStr)
    private val end: LocalTime = LocalTime.parse(endStr)
    private val shift =
        Shift(
            id = 5,
            cabinet = cabinet,
            user = user,
            startTime = start,
            endTime = end,
            status = ShiftStatus.INACTIVE,
            lastEvaluatedDate = LocalDate.now(),
        )

    @Test
    fun `getShift returns the shift when found`() {
        every { shiftRepo.findById(5) } returns Optional.of(shift)

        val result = service.getShift(5)

        assertIs<Either.Success<Shift>>(result)
        assertEquals(shift, result.value)
    }

    @Test
    fun `getShift returns ShiftNotFound when missing`() {
        every { shiftRepo.findById(99) } returns Optional.empty()

        val result = service.getShift(99)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.ShiftNotFound, result.value)
    }

    @Test
    fun `createShift fails when actor is not back office`() {
        val result = service.createShift(1, 1, startStr, endStr, user)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.NotAuthorized, result.value)
    }

    @Test
    fun `createShift fails when user id invalid`() {
        every { userRepo.findByIdOrNull(99) } returns null

        val result = service.createShift(99, 1, startStr, endStr, backOffice)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.InvalidUserId, result.value)
    }

    @Test
    fun `createShift fails when cabinet id invalid`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { cabinetRepo.findById(99) } returns Optional.empty()

        val result = service.createShift(1, 99, startStr, endStr, backOffice)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.InvalidCabinetId, result.value)
    }

    @Test
    fun `createShift fails when start time is not parseable`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { cabinetRepo.findById(1) } returns Optional.of(cabinet)

        val result = service.createShift(1, 1, "not-a-time", endStr, backOffice)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.InvalidTimeFormat, result.value)
    }

    @Test
    fun `createShift persists when inputs are valid`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { cabinetRepo.findById(1) } returns Optional.of(cabinet)
        val saved = slot<Shift>()
        every { shiftRepo.save(capture(saved)) } answers { firstArg() }

        val result = service.createShift(1, 1, startStr, endStr, backOffice)

        assertIs<Either.Success<Shift>>(result)
        assertEquals(user, saved.captured.user)
        assertEquals(cabinet, saved.captured.cabinet)
        assertEquals(start, saved.captured.startTime)
        assertEquals(end, saved.captured.endTime)
        assertEquals(ShiftStatus.INACTIVE, saved.captured.status)
    }

    @Test
    fun `findShiftsByCabinet returns the cabinet shifts`() {
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet
        every { shiftRepo.findByCabinet(cabinet) } returns listOf(shift)

        val result = service.findShiftsByCabinet(1)

        assertIs<Either.Success<List<Shift>>>(result)
        assertEquals(listOf(shift), result.value)
    }

    @Test
    fun `findShiftsByCabinet returns InvalidCabinetId when cabinet missing`() {
        every { cabinetRepo.findByIdOrNull(99) } returns null

        val result = service.findShiftsByCabinet(99)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.InvalidCabinetId, result.value)
    }

    @Test
    fun `findShiftsByUser returns the user shifts`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { shiftRepo.findByUser(user) } returns listOf(shift)

        val result = service.findShiftsByUser(1)

        assertIs<Either.Success<List<Shift>>>(result)
        assertEquals(listOf(shift), result.value)
    }

    @Test
    fun `findShiftsByUser returns InvalidUserId when user missing`() {
        every { userRepo.findByIdOrNull(99) } returns null

        val result = service.findShiftsByUser(99)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.InvalidUserId, result.value)
    }
}
