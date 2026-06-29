package pt.isel

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager
import org.springframework.data.domain.PageRequest
import pt.isel.activity.Activity
import pt.isel.activity.ActivityType
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.tools.Tool
import pt.isel.tools.ToolStatus
import pt.isel.user.User
import pt.isel.user.UserStatus
import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ActivityRepositoryTest {
    @Autowired
    lateinit var activities: ActivityRepository

    @Autowired
    lateinit var em: TestEntityManager

    private val date: Instant = Instant.parse("2026-01-01T10:00:00Z")

    private lateinit var user: User
    private lateinit var cabinet: Cabinet
    private lateinit var tool: Tool

    private fun seed() {
        val profile = em.persist(Profile(id = 1, role = Role.MECHANIC, description = "Mechanic"))
        user =
            em.persist(
                User(
                    name = "Joana",
                    email = "joana@isel.pt",
                    profile = profile,
                    status = UserStatus.ACTIVE,
                    passwordValidation = PasswordValidationInfo("hash"),
                ),
            )
        cabinet = em.persist(Cabinet(description = "Cabinet A", status = CabinetStatus.CLOSED, location = "Sector 2"))
        tool = em.persist(Tool(name = "Drill", cabinet = cabinet, status = ToolStatus.AVAILABLE, location = "Sector 2"))
    }

    @Test
    fun `findByUserId returns the user's activities`() {
        seed()
        em.persist(Activity(type = ActivityType.OPEN_CABINET, date = date, user = user, cabinet = cabinet))
        em.persist(Activity(type = ActivityType.REMOVE_TOOL, date = date, user = user, tool = tool))
        em.flush()

        assertEquals(2, activities.findByUserId(user.id, PageRequest.of(0, 10)).content.size)
    }

    @Test
    fun `findByToolId only returns activities for that tool`() {
        seed()
        em.persist(Activity(type = ActivityType.REMOVE_TOOL, date = date, user = user, tool = tool))
        em.persist(Activity(type = ActivityType.OPEN_CABINET, date = date, user = user, cabinet = cabinet))
        em.flush()

        val result = activities.findByToolId(tool.id, PageRequest.of(0, 10))

        assertEquals(1, result.content.size)
        assertEquals(tool.id, result.content.single().tool?.id)
    }

    @Test
    fun `findByCabinetId only returns activities for that cabinet`() {
        seed()
        em.persist(Activity(type = ActivityType.OPEN_CABINET, date = date, user = user, cabinet = cabinet))
        em.persist(Activity(type = ActivityType.REMOVE_TOOL, date = date, user = user, tool = tool))
        em.flush()

        val result = activities.findByCabinetId(cabinet.id, PageRequest.of(0, 10))

        assertEquals(1, result.content.size)
        assertEquals(cabinet.id, result.content.single().cabinet?.id)
    }
}
