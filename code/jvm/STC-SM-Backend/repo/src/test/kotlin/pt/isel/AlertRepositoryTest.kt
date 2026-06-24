package pt.isel

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import pt.isel.alert.Alert
import pt.isel.alert.AlertStatus
import pt.isel.alert.AlertType
import pt.isel.auth.PasswordValidationInfo
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.user.User
import pt.isel.user.UserStatus
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AlertRepositoryTest {
    @Autowired
    lateinit var alerts: AlertRepository

    @Autowired
    lateinit var em: TestEntityManager

    private val date: Instant = Instant.parse("2026-01-01T10:00:00Z")

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

    private fun persistAlert(
        user: User,
        type: AlertType,
        status: AlertStatus,
    ) = em.persist(
        Alert(date = date, type = type, status = status, message = "msg", user = user),
    )

    @Test
    fun `findByType only returns alerts of that type`() {
        val user = persistUser()
        persistAlert(user, AlertType.LATE_START, AlertStatus.UNREAD)
        persistAlert(user, AlertType.MISSING_TOOL, AlertStatus.UNREAD)
        em.flush()

        val result = alerts.findByType(AlertType.LATE_START)

        assertEquals(1, result.size)
        assertEquals(AlertType.LATE_START, result.single().type)
    }

    @Test
    fun `findByStatus only returns alerts with that status`() {
        val user = persistUser()
        persistAlert(user, AlertType.LATE_START, AlertStatus.UNREAD)
        persistAlert(user, AlertType.EARLY_ENDING, AlertStatus.READ)
        em.flush()

        val result = alerts.findByStatus(AlertStatus.READ)

        assertEquals(1, result.size)
        assertEquals(AlertStatus.READ, result.single().status)
    }
}
