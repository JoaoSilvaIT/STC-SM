package pt.isel

import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
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
import java.time.LocalDateTime
import kotlin.time.Duration

// Initializes the Database with the 3 Profiles and the Admin User.
@Component
class DataInitializer(
    private val profileRepository: ProfileRepository,
    private val userRepository: UserRepository,
    private val cabinetRepository: CabinetRepository,
    private val shiftRepository: ShiftRepository,
    private val toolRepository: ToolRepository,
    private val passwordEncoder: PasswordEncoder
) : CommandLineRunner {
    override fun run(vararg args: String) {
        // Checks if the table is empty
        val profiles = listOf(
            Profile(id = 1, role = Role.MECHANIC, description = "Mechanic"),
            Profile(id = 2, role = Role.BACK_OFFICE, description = "Back Office"),
            Profile(id = 3, role = Role.ADMIN, description = "Administrator")
        )
        if (profileRepository.count() == 0L) {
            profileRepository.saveAll(profiles)
        }
        val users = listOf(
            User(
                name = "Admin",
                email = "admin@isel.pt",
                profile = profiles[2],
                status = UserStatus.ACTIVE,
                passwordValidation = PasswordValidationInfo(passwordEncoder.encode("admin")!!)
            ),
            User(
                name = "Back Office",
                email = "back@isel.pt",
                profile = profiles[1],
                status = UserStatus.ACTIVE,
                passwordValidation = PasswordValidationInfo(passwordEncoder.encode("back")!!)
            ),
            User(
                name = "Mechanic",
                email = "mechanic@isel.pt",
                profile = profiles[0],
                status = UserStatus.ACTIVE,
                passwordValidation = PasswordValidationInfo(passwordEncoder.encode("mechanic")!!)
            )
        )
        if (userRepository.count() == 0L) {
            userRepository.saveAll(users)
        }
        val cabinet = Cabinet(
            description = "White and Red Cabinet",
            status = CabinetStatus.CLOSED,
            location = "Sector 2"
        )
        if (cabinetRepository.count() == 0L) {
            cabinetRepository.save(cabinet)
        }
        if (toolRepository.count() == 0L) {
            val tool = Tool(
                name = "Screwdriver",
                cabinet = cabinet,
                status = ToolStatus.AVAILABLE,
                location = "Sector 2"
            )
            toolRepository.save(tool)
        }
        if (shiftRepository.count() == 0L) {
            val shift = Shift(
                cabinet = cabinet,
                user = users[2],
                startTime = Instant.now(),
                endTime = Instant.now().plusSeconds(15 * 60),
                status = ShiftStatus.ON_GOING,
            )
            shiftRepository.save(shift)
        }
    }
}

