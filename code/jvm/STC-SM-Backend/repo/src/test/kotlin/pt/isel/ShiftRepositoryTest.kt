package pt.isel

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.shift.Shift
import pt.isel.shift.ShiftStatus
import pt.isel.user.User
import pt.isel.user.UserStatus
import java.time.LocalDate
import java.time.LocalTime
import kotlin.test.Test
import kotlin.test.assertEquals

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ShiftRepositoryTest {
    @Autowired
    lateinit var shifts: ShiftRepository

    @Autowired
    lateinit var em: TestEntityManager

    private val start: LocalTime = LocalTime.of(8, 0)
    private val end: LocalTime = LocalTime.of(16, 0)

    private fun persistUser(
        name: String,
        email: String,
    ): User {
        val profile =
            em.find(Profile::class.java, 1)
                ?: em.persist(Profile(id = 1, role = Role.MECHANIC, description = "Mechanic"))
        return em.persist(
            User(
                name = name,
                email = email,
                profile = profile,
                status = UserStatus.ACTIVE,
                passwordValidation = PasswordValidationInfo("hash"),
            ),
        )
    }

    private fun persistCabinet(description: String): Cabinet =
        em.persist(Cabinet(description = description, status = CabinetStatus.CLOSED, location = "Sector 2"))

    private fun newShift(
        cabinet: Cabinet,
        user: User,
    ) = Shift(
        cabinet = cabinet,
        user = user,
        startTime = start,
        endTime = end,
        status = ShiftStatus.INACTIVE,
        lastEvaluatedDate = LocalDate.now(),
    )

    @Test
    fun `findByCabinet only returns shifts for that cabinet`() {
        val user = persistUser("Joana", "joana@isel.pt")
        val cabinetA = persistCabinet("Cabinet A")
        val cabinetB = persistCabinet("Cabinet B")
        em.persist(newShift(cabinetA, user))
        em.persist(newShift(cabinetB, user))
        em.flush()

        val result = shifts.findByCabinet(cabinetA)

        assertEquals(1, result.size)
        assertEquals(cabinetA.id, result.single().cabinet.id)
    }

    @Test
    fun `findByUser only returns shifts for that user`() {
        val joana = persistUser("Joana", "joana@isel.pt")
        val rui = persistUser("Rui", "rui@isel.pt")
        val cabinet = persistCabinet("Cabinet A")
        em.persist(newShift(cabinet, joana))
        em.persist(newShift(cabinet, rui))
        em.flush()

        val result = shifts.findByUser(joana)

        assertEquals(1, result.size)
        assertEquals(joana.id, result.single().user.id)
    }

    @Test
    fun `findByUser returns an empty list when the user has no shifts`() {
        val user = persistUser("Joana", "joana@isel.pt")
        em.flush()

        assertEquals(emptyList(), shifts.findByUser(user))
    }
}
