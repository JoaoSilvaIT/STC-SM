package pt.isel

import org.springframework.boot.CommandLineRunner
import org.springframework.cglib.core.Local
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import pt.isel.activity.Activity
import pt.isel.activity.ActivityType
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.shift.Shift
import pt.isel.shift.ShiftStatus
import pt.isel.tools.Tool
import pt.isel.tools.ToolStatus
import pt.isel.user.User
import pt.isel.user.UserStatus
import java.time.Instant
import java.time.LocalTime

// Initializes the Database with the 3 Profiles and the Admin User.
@Component
class DataInitializer(
    private val profileRepository: ProfileRepository,
    private val userRepository: UserRepository,
    private val cabinetRepository: CabinetRepository,
    private val shiftRepository: ShiftRepository,
    private val toolRepository: ToolRepository,
    private val activityRepository: ActivityRepository,
    private val passwordEncoder: PasswordEncoder,
) : CommandLineRunner {
    override fun run(vararg args: String) {
        val profiles =
            listOf(
                Profile(id = 1, role = Role.MECHANIC, description = "Mechanic"),
                Profile(id = 2, role = Role.BACK_OFFICE, description = "Back Office"),
                Profile(id = 3, role = Role.ADMIN, description = "Administrator"),
            )
        // Checks if the table is empty
        if (profileRepository.count() == 0L) {
            profileRepository.saveAll(profiles)
        }
        val users =
            listOf(
                User(
                    name = "Admin",
                    email = "admin@isel.pt",
                    profile = profiles[2],
                    status = UserStatus.ACTIVE,
                    passwordValidation = PasswordValidationInfo(passwordEncoder.encode("admin")!!),
                ),
                User(
                    name = "Back Office",
                    email = "back@isel.pt",
                    profile = profiles[1],
                    status = UserStatus.ACTIVE,
                    passwordValidation = PasswordValidationInfo(passwordEncoder.encode("back")!!),
                ),
                User(
                    name = "João Silva",
                    email = "joaosilva@isel.pt",
                    profile = profiles[0],
                    status = UserStatus.ACTIVE,
                    passwordValidation = PasswordValidationInfo(passwordEncoder.encode("silva")!!),
                ),
                User(
                    name = "Bernardo Jaco",
                    email = "bernardojaco@isel.pt",
                    profile = profiles[0],
                    status = UserStatus.ACTIVE,
                    passwordValidation = PasswordValidationInfo(passwordEncoder.encode("jaco")!!),
                ),
                User(
                    name = "Pedro Monteiro",
                    email = "pedromonteiro@isel.pt",
                    profile = profiles[0],
                    status = UserStatus.ACTIVE,
                    passwordValidation = PasswordValidationInfo(passwordEncoder.encode("monteiro")!!),
                ),
            )
        if (userRepository.count() == 0L) {
            userRepository.saveAll(users)
        }
        val cabinets =
            listOf(
                Cabinet(
                    description = "White and Red Cabinet",
                    status = CabinetStatus.CLOSED,
                    location = "Sector 2",
                ),
                Cabinet(
                    description = "Black and Blue Cabinet",
                    status = CabinetStatus.CLOSED,
                    location = "Sector 3",
                ),
            )
        if (cabinetRepository.count() == 0L) {
            cabinetRepository.saveAll(cabinets)
        }
        val tools =
            listOf(
                Tool(
                    name = "Screwdriver",
                    cabinet = cabinets[0],
                    status = ToolStatus.AVAILABLE,
                    location = "Sector 2",
                ),
                Tool(
                    name = "Wrench",
                    cabinet = cabinets[1],
                    status = ToolStatus.AVAILABLE,
                    location = "Sector 3",
                ),
            )
        if (toolRepository.count() == 0L) {
            toolRepository.saveAll(tools)
        }
        val shifts =
            listOf(
                Shift(
                    cabinet = cabinets[0],
                    user = users[2],
                    startTime = LocalTime.now(),
                    endTime = LocalTime.now().plusSeconds(3 * 60),
                    status = ShiftStatus.INACTIVE,
                    lastEvaluatedDate = null,
                ),
                Shift(
                    cabinet = cabinets[0],
                    user = users[3],
                    startTime = LocalTime.now().plusSeconds(3 * 60),
                    endTime = LocalTime.now().plusSeconds(6 * 60),
                    status = ShiftStatus.INACTIVE,
                    lastEvaluatedDate = null,
                ),
                Shift(
                    cabinet = cabinets[0],
                    user = users[4],
                    startTime = LocalTime.now().plusSeconds(2 * 60),
                    endTime = LocalTime.now().plusSeconds(6 * 60),
                    status = ShiftStatus.INACTIVE,
                    lastEvaluatedDate = null,
                ),
            )
        if (shiftRepository.count() == 0L) {
            shiftRepository.saveAll(shifts)
        }
        if (activityRepository.count() == 0L) {
            val activity =
                Activity(
                    user = users[2],
                    type = ActivityType.STARTED_SHIFT,
                    date = Instant.now(),
                    tool = null,
                    cabinet = cabinets[0],
                    shift = shifts[0],
                )
            activityRepository.save(activity)
        }
    }
}
