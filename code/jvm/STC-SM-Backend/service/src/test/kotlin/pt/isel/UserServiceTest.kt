package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.crypto.password.PasswordEncoder
import pt.isel.auth.PasswordValidationInfo
import pt.isel.errors.UserError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.user.User
import pt.isel.user.UserRepository
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class UserServiceTest {

    private val passwordEncoder: PasswordEncoder = mockk {
        every { encode(any()) } returns "hashed"
    }
    private val userRepo: UserRepository = mockk(relaxed = true)
    private val profileRepo: ProfileRepository = mockk(relaxed = true)
    private val service = UserService(passwordEncoder, userRepo, profileRepo)

    private val profile = Profile(id = 1, role = Role.MECHANIC, description = "")
    private val existingUser = User(
        id = 7,
        name = "Joana",
        email = "joana@example.com",
        profile = profile,
        status = UserStatus.ACTIVE,
        passwordValidation = PasswordValidationInfo("h"),
    )

    @Test
    fun `createUser fails on blank name`() {
        val result = service.createUser(" ", "a@b.com", "pw", 1)
        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.BlankName, result.value)
    }

    @Test
    fun `createUser fails on blank email`() {
        val result = service.createUser("name", "  ", "pw", 1)
        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.BlankEmail, result.value)
    }

    @Test
    fun `createUser fails on blank password`() {
        val result = service.createUser("name", "a@b.com", "", 1)
        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.BlankPassword, result.value)
    }

    @Test
    fun `createUser fails when email already exists (pre-check)`() {
        every { userRepo.findByEmail("a@b.com") } returns existingUser

        val result = service.createUser("name", "a@b.com", "pw", 1)

        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.EmailAlreadyInUse, result.value)
        verify(exactly = 0) { userRepo.saveAndFlush(any<User>()) }
    }

    @Test
    fun `createUser fails when profile id is unknown`() {
        every { userRepo.findByEmail("a@b.com") } returns null
        every { profileRepo.findByIdOrNull(99) } returns null

        val result = service.createUser("name", "a@b.com", "pw", 99)

        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.InvalidProfileId, result.value)
    }

    @Test
    fun `createUser maps unique violation race to EmailAlreadyInUse`() {
        every { userRepo.findByEmail("a@b.com") } returns null
        every { profileRepo.findByIdOrNull(1) } returns profile
        every { userRepo.saveAndFlush(any<User>()) } throws DataIntegrityViolationException("dup")

        val result = service.createUser("name", "a@b.com", "pw", 1)

        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.EmailAlreadyInUse, result.value)
    }

    @Test
    fun `createUser trims email and persists`() {
        val saved = slot<User>()
        every { userRepo.findByEmail("a@b.com") } returns null
        every { profileRepo.findByIdOrNull(1) } returns profile
        every { userRepo.saveAndFlush(capture(saved)) } answers { firstArg() }

        val result = service.createUser("name", "  a@b.com  ", "pw", 1)

        assertIs<Either.Success<User>>(result)
        assertEquals("a@b.com", saved.captured.email)
        assertEquals("hashed", saved.captured.passwordValidation.hash)
        assertEquals(UserStatus.ACTIVE, saved.captured.status)
        assertEquals(profile, saved.captured.profile)
    }

    @Test
    fun `deleteUser succeeds when user exists`() {
        every { userRepo.findByIdOrNull(7) } returns existingUser

        val result = service.deleteUser(7)

        assertIs<Either.Success<Unit>>(result)
        verify { userRepo.delete(existingUser) }
    }

    @Test
    fun `deleteUser returns UserNotFound when missing`() {
        every { userRepo.findByIdOrNull(99) } returns null

        val result = service.deleteUser(99)

        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.UserNotFound, result.value)
    }
}
