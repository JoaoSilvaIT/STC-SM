package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.springframework.security.crypto.password.PasswordEncoder
import pt.isel.auth.PasswordValidationInfo
import pt.isel.auth.Sha256TokenEncoder
import pt.isel.auth.TokenDomainConfig
import pt.isel.auth.UserSession
import pt.isel.errors.UserError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.user.User
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class AuthServiceTest {
    private val now: Instant = Instant.parse("2026-01-01T00:00:00Z")
    private val clock: Clock = Clock.fixed(now, ZoneOffset.UTC)
    private val tokenEncoder = Sha256TokenEncoder()

    // tokenSizeInBytes = 32 matches the size of a Base64-URL-decoded 43-or-44-char token.
    private val config =
        TokenDomainConfig(
            tokenSizeInBytes = 32,
            accessTokenExpiration = Duration.ofMinutes(15),
            refreshTokenExpiration = Duration.ofDays(30),
            minPasswordLength = 1,
        )

    private val passwordEncoder: PasswordEncoder = mockk()
    private val userRepo: UserRepository = mockk()
    private val sessionRepo: UserSessionRepository = mockk(relaxed = true)
    private val service = AuthService(passwordEncoder, userRepo, sessionRepo, clock, config, tokenEncoder)

    private val user =
        User(
            id = 1,
            name = "Joana",
            email = "j@example.com",
            profile = Profile(id = 1, role = Role.MECHANIC, description = ""),
            status = UserStatus.ACTIVE,
            passwordValidation = PasswordValidationInfo("hashed"),
        )

    // A valid Base64-URL-encoded token of the exact configured size.
    private val sampleToken = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

    @Test
    fun `login fails when email unknown`() {
        every { userRepo.findByEmail("missing@x") } returns null

        val result = service.login("missing@x", "pw")

        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.UserNotFoundOrInvalidCredentials, result.value)
    }

    @Test
    fun `login fails when password does not match`() {
        every { userRepo.findByEmail("j@example.com") } returns user
        every { passwordEncoder.matches("wrong", "hashed") } returns false

        val result = service.login("j@example.com", "wrong")

        assertIs<Either.Failure<UserError>>(result)
        assertEquals(UserError.UserNotFoundOrInvalidCredentials, result.value)
        verify(exactly = 0) { sessionRepo.save(any<UserSession>()) }
    }

    @Test
    fun `login succeeds and persists a session`() {
        every { userRepo.findByEmail("j@example.com") } returns user
        every { passwordEncoder.matches("pw", "hashed") } returns true
        val saved = slot<UserSession>()
        every { sessionRepo.save(capture(saved)) } answers { firstArg() }

        val result = service.login("j@example.com", "pw")

        assertIs<Either.Success<*>>(result)
        val tokens = result.value
        assertNotNull(tokens)
        assertEquals(user, saved.captured.user)
        assertEquals(now.plus(config.accessTokenExpiration), saved.captured.accessTokenExpiresAt)
        assertEquals(now.plus(config.refreshTokenExpiration), saved.captured.refreshTokenExpiresAt)
    }

    @Test
    fun `getUserByToken returns null on malformed token`() {
        assertNull(service.getUserByToken("not-base64!"))
    }

    @Test
    fun `getUserByToken returns null when session is missing`() {
        val hashed = tokenEncoder.createValidationInformation(sampleToken).validationInfo
        every { sessionRepo.findByAccessTokenValidationInfo(hashed) } returns null

        assertNull(service.getUserByToken(sampleToken))
    }

    @Test
    fun `getUserByToken returns null for an expired session`() {
        val hashed = tokenEncoder.createValidationInformation(sampleToken).validationInfo
        val expiredSession = sessionFor(user, accessExpiresAt = now.minusSeconds(1))
        every { sessionRepo.findByAccessTokenValidationInfo(hashed) } returns expiredSession

        val result = service.getUserByToken(sampleToken)

        assertNull(result)
        // NOTE: this branch's getUserByToken does NOT delete the expired session (main did).
        verify(exactly = 0) { sessionRepo.delete(any<UserSession>()) }
    }

    @Test
    fun `getUserByToken returns the user when session is valid`() {
        val hashed = tokenEncoder.createValidationInformation(sampleToken).validationInfo
        val session = sessionFor(user, accessExpiresAt = now.plusSeconds(60))
        every { sessionRepo.findByAccessTokenValidationInfo(hashed) } returns session

        assertEquals(user, service.getUserByToken(sampleToken))
        verify(exactly = 0) { sessionRepo.delete(any<UserSession>()) }
    }

    @Test
    fun `revokeToken deletes the session and returns true`() {
        val hashed = tokenEncoder.createValidationInformation(sampleToken).validationInfo
        val session = sessionFor(user)
        every { sessionRepo.findByAccessTokenValidationInfo(hashed) } returns session

        assertEquals(true, service.revokeToken(sampleToken))
        verify { sessionRepo.delete(session) }
    }

    @Test
    fun `revokeToken returns false when no session matches`() {
        val hashed = tokenEncoder.createValidationInformation(sampleToken).validationInfo
        every { sessionRepo.findByAccessTokenValidationInfo(hashed) } returns null

        assertEquals(false, service.revokeToken(sampleToken))
    }

    @Test
    fun `refreshToken fails on malformed token`() {
        val result = service.refreshToken("nope!")
        assertIs<Either.Failure<UserError>>(result)
    }

    @Test
    fun `refreshToken fails when no session matches the refresh token`() {
        val hashed = tokenEncoder.createValidationInformation(sampleToken).validationInfo
        every { sessionRepo.findByRefreshTokenValidationInfo(hashed) } returns null

        val result = service.refreshToken(sampleToken)
        assertIs<Either.Failure<UserError>>(result)
    }

    @Test
    fun `refreshToken deletes session when refresh token expired`() {
        val hashed = tokenEncoder.createValidationInformation(sampleToken).validationInfo
        val expired = sessionFor(user, refreshExpiresAt = now.minusSeconds(1))
        every { sessionRepo.findByRefreshTokenValidationInfo(hashed) } returns expired

        val result = service.refreshToken(sampleToken)

        assertIs<Either.Failure<UserError>>(result)
        verify { sessionRepo.delete(expired) }
    }

    @Test
    fun `refreshToken issues a new access token and bumps expiration`() {
        val hashed = tokenEncoder.createValidationInformation(sampleToken).validationInfo
        val session = sessionFor(user, accessExpiresAt = now.plusSeconds(5), refreshExpiresAt = now.plusSeconds(3600))
        every { sessionRepo.findByRefreshTokenValidationInfo(hashed) } returns session
        val saved = slot<UserSession>()
        every { sessionRepo.save(capture(saved)) } answers { firstArg() }

        val result = service.refreshToken(sampleToken)

        assertIs<Either.Success<String>>(result)
        assertEquals(now.plus(config.accessTokenExpiration), saved.captured.accessTokenExpiresAt)
    }

    private fun sessionFor(
        u: User,
        accessExpiresAt: Instant = now.plusSeconds(60),
        refreshExpiresAt: Instant = now.plusSeconds(3600),
    ) = UserSession(
        accessToken = tokenEncoder.createValidationInformation("access"),
        refreshToken = tokenEncoder.createValidationInformation("refresh"),
        accessTokenExpiresAt = accessExpiresAt,
        refreshTokenExpiresAt = refreshExpiresAt,
        user = u,
    )
}
