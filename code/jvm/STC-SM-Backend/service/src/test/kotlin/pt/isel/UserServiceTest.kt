package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.crypto.password.PasswordEncoder
import pt.isel.auth.PasswordValidationInfo
import pt.isel.errors.UserError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.user.User
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class UserServiceTest {
    private val passwordEncoder: PasswordEncoder =
        mockk {
            every { encode(any()) } returns "hashed"
        }
    private val userRepo: UserRepository = mockk(relaxed = true)
    private val profileRepo: ProfileRepository = mockk(relaxed = true)
    private val service = UserService(passwordEncoder, userRepo, profileRepo)

    private val mechanicProfile = Profile(id = 1, role = Role.MECHANIC, description = "")
    private val adminProfile = Profile(id = 2, role = Role.ADMIN, description = "")
    private val admin =
        User(
            id = 1,
            name = "Root",
            email = "admin@example.com",
            profile = adminProfile,
            status = UserStatus.ACTIVE,
            passwordValidation = PasswordValidationInfo("admin-hash"),
        )
    private val nonAdmin =
        User(
            id = 2,
            name = "Joana",
            email = "joana@example.com",
            profile = mechanicProfile,
            status = UserStatus.ACTIVE,
            passwordValidation = PasswordValidationInfo("h"),
        )

    @Test
    fun `createUser fails on blank name`() {
        val result = service.createUser(" ", "a@b.com", "pw", 1, admin)
        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.BlankName, result.value)
    }

    @Test
    fun `createUser fails on blank email`() {
        val result = service.createUser("name", "  ", "pw", 1, admin)
        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.BlankEmail, result.value)
    }

    @Test
    fun `createUser fails on blank password`() {
        val result = service.createUser("name", "a@b.com", "", 1, admin)
        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.BlankPassword, result.value)
    }

    @Test
    fun `createUser fails when caller is not admin`() {
        val result = service.createUser("name", "a@b.com", "pw", 1, nonAdmin)
        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.NotAuthorized, result.value)
    }

    @Test
    fun `createUser fails when email already exists`() {
        every { userRepo.findByEmail("a@b.com") } returns nonAdmin

        val result = service.createUser("name", "a@b.com", "pw", 1, admin)

        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.EmailAlreadyInUse, result.value)
        verify(exactly = 0) { userRepo.save(any<User>()) }
    }

    @Test
    fun `createUser trims email and persists`() {
        val saved = slot<User>()
        every { userRepo.findByEmail("a@b.com") } returns null
        every { profileRepo.findByIdOrNull(1) } returns mechanicProfile
        every { userRepo.save(capture(saved)) } answers { firstArg() }

        val result = service.createUser("name", "  a@b.com  ", "pw", 1, admin)

        assertIs<Either.Success<User>>(result)
        assertEquals("a@b.com", saved.captured.email)
        assertEquals("hashed", saved.captured.passwordValidation.hash)
        assertEquals(UserStatus.ACTIVE, saved.captured.status)
        assertEquals(mechanicProfile, saved.captured.profile)
    }

    @Test
    fun `createUser fails when profile id does not exist`() {
        every { userRepo.findByEmail("a@b.com") } returns null
        every { profileRepo.findByIdOrNull(99) } returns null

        val result = service.createUser("name", "a@b.com", "pw", 99, admin)

        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.InvalidProfileId, result.value)
        verify(exactly = 0) { userRepo.save(any<User>()) }
    }
}
