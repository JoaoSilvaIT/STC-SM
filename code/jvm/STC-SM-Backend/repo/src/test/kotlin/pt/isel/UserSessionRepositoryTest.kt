package pt.isel

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import pt.isel.auth.PasswordValidationInfo
import pt.isel.auth.TokenValidationInfo
import pt.isel.auth.UserSession
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.user.User
import pt.isel.user.UserStatus
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserSessionRepositoryTest {
    @Autowired
    lateinit var sessions: UserSessionRepository

    @Autowired
    lateinit var em: TestEntityManager

    private val now: Instant = Instant.parse("2026-01-01T00:00:00Z")

    private fun persistUser(): User {
        val profile = em.persist(Profile(id = 1, role = Role.MECHANIC, description = "Mechanic"))
        return em.persist(
            User(
                name = "Joana",
                email = "joana@isel.pt",
                profile = profile,
                status = UserStatus.ACTIVE,
                passwordValidation = PasswordValidationInfo("hash"),
            ),
        )
    }

    private fun persistSession(user: User): UserSession =
        em.persist(
            UserSession(
                accessToken = TokenValidationInfo("access-hash"),
                refreshToken = TokenValidationInfo("refresh-hash"),
                accessTokenExpiresAt = now.plusSeconds(900),
                refreshTokenExpiresAt = now.plusSeconds(3600),
                user = user,
            ),
        )

    @Test
    fun `findByAccessTokenValidationInfo resolves the embedded access_token column`() {
        val session = persistSession(persistUser())
        em.flush()

        assertEquals(session.id, sessions.findByAccessTokenValidationInfo("access-hash")?.id)
    }

    @Test
    fun `findByRefreshTokenValidationInfo resolves the embedded refresh_token column`() {
        val session = persistSession(persistUser())
        em.flush()

        assertEquals(session.id, sessions.findByRefreshTokenValidationInfo("refresh-hash")?.id)
    }

    @Test
    fun `access and refresh tokens are stored in distinct columns`() {
        persistSession(persistUser())
        em.flush()

        // Only holds if the @AttributeOverrides mapped the two embedded tokens to separate columns.
        assertNull(sessions.findByAccessTokenValidationInfo("refresh-hash"))
        assertNull(sessions.findByRefreshTokenValidationInfo("access-hash"))
    }
}
