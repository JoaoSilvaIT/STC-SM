package pt.isel

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import pt.isel.auth.PasswordValidationInfo
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.user.User
import pt.isel.user.UserStatus
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {
    @Autowired
    lateinit var users: UserRepository

    @Autowired
    lateinit var em: TestEntityManager

    private fun persistMechanicProfile(): Profile = em.persist(Profile(id = 1, role = Role.MECHANIC, description = "Mechanic"))

    @Test
    fun `findByEmail returns the matching user`() {
        val profile = persistMechanicProfile()
        em.persist(
            User(
                name = "Joana",
                email = "joana@isel.pt",
                profile = profile,
                status = UserStatus.ACTIVE,
                passwordValidation = PasswordValidationInfo("hash"),
            ),
        )
        em.flush()

        val found = users.findByEmail("joana@isel.pt")

        assertEquals("Joana", found?.name)
        assertEquals("hash", found?.passwordValidation?.hash)
    }

    @Test
    fun `findByEmail returns null when no user matches`() {
        assertNull(users.findByEmail("missing@isel.pt"))
    }
}
