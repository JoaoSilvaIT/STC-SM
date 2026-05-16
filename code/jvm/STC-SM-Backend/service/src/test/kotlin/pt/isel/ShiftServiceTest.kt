package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.data.repository.findByIdOrNull
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.errors.ShiftError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.shift.Shift
import pt.isel.user.User
import pt.isel.user.UserRepository
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class ShiftServiceTest {

    private val shiftRepo: ShiftRepository = mockk(relaxed = true)
    private val userRepo: UserRepository = mockk()
    private val cabinetRepo: CabinetRepository = mockk()
    private val service = ShiftService(shiftRepo, userRepo, cabinetRepo)

    private val profile = Profile(id = 1, role = Role.MECHANIC, description = "")
    private val user = User(
        id = 1, name = "Joana", email = "j@x", profile = profile,
        status = UserStatus.ACTIVE, passwordValidation = PasswordValidationInfo("h"),
    )
    private val cabinet = Cabinet(id = 1, description = "C", status = CabinetStatus.OPEN, location = "loc")
    private val start: Instant = Instant.parse("2026-01-01T08:00:00Z")
    private val end: Instant = Instant.parse("2026-01-01T16:00:00Z")

    @Test
    fun `getShift returns the shift when found`() {
        val shift = Shift(id = 5, cabinet = cabinet, user = user, startTime = start, endTime = end)
        every { shiftRepo.findByIdOrNull(5) } returns shift

        val result = service.getShift(5)

        assertIs<Either.Success<Shift>>(result)
        assertEquals(shift, result.value)
    }

    @Test
    fun `getShift returns ShiftNotFound when missing`() {
        every { shiftRepo.findByIdOrNull(99) } returns null

        val result = service.getShift(99)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.ShiftNotFound, result.value)
    }

    @Test
    fun `createShift fails when user id invalid`() {
        every { userRepo.findByIdOrNull(99) } returns null

        val result = service.createShift(99, 1, start, end)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.InvalidUserId, result.value)
    }

    @Test
    fun `createShift fails when cabinet id invalid`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { cabinetRepo.findByIdOrNull(99) } returns null

        val result = service.createShift(1, 99, start, end)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.InvalidCabinetId, result.value)
    }

    @Test
    fun `createShift fails when start is after end`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet

        val result = service.createShift(1, 1, end, start)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.InvalidTimeRange, result.value)
    }

    @Test
    fun `createShift persists when inputs are valid`() {
        every { userRepo.findByIdOrNull(1) } returns user
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet
        val saved = slot<Shift>()
        every { shiftRepo.save(capture(saved)) } answers { firstArg() }

        val result = service.createShift(1, 1, start, end)

        assertIs<Either.Success<Shift>>(result)
        assertEquals(user, saved.captured.user)
        assertEquals(cabinet, saved.captured.cabinet)
        assertEquals(start, saved.captured.startTime)
        assertEquals(end, saved.captured.endTime)
    }

    @Test
    fun `deleteShift deletes when found`() {
        val shift = Shift(id = 5, cabinet = cabinet, user = user, startTime = start, endTime = end)
        every { shiftRepo.findByIdOrNull(5) } returns shift

        val result = service.deleteShift(5)

        assertIs<Either.Success<Unit>>(result)
        verify { shiftRepo.deleteById(5) }
    }

    @Test
    fun `deleteShift returns ShiftNotFound when missing`() {
        every { shiftRepo.findByIdOrNull(99) } returns null

        val result = service.deleteShift(99)

        assertIs<Either.Failure<ShiftError>>(result)
        assertEquals(ShiftError.ShiftNotFound, result.value)
        verify(exactly = 0) { shiftRepo.deleteById(any<Int>()) }
    }
}
