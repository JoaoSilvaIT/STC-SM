package pt.isel

import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import pt.isel.auth.PasswordValidationInfo
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.user.User
import pt.isel.user.UserStatus

// Initializes the Database with the 3 Profiles and the Admin User.
@Component
class DataInitializer(
    private val profileRepository: ProfileRepository,
    private val userRepository: UserRepository,
    private val cabinetRepository: CabinetRepository,
    private val shiftRepository: ShiftRepository,
    private val passwordEncoder: PasswordEncoder
) : CommandLineRunner {
    override fun run(vararg args: String) {
        // Checks if the table is empty
        if (profileRepository.count() == 0L) {
            val profiles = listOf(
                Profile(id = 1, role = Role.MECHANIC, description = "Mechanic"),
                Profile(id = 2, role = Role.BACK_OFFICE, description = "Back Office"),
                Profile(id = 3, role = Role.ADMIN, description = "Administrator")
            )
            profileRepository.saveAll(profiles)
        }
        if (userRepository.count() == 0L) {
            val userAdmin = User(
                name = "Admin",
                email = "admin@isel.pt",
                profile = Profile(id = 3, role = Role.ADMIN, description = "Administrator"),
                status = UserStatus.ACTIVE,
                passwordValidation = PasswordValidationInfo(passwordEncoder.encode("admin")!!)
            )
            userRepository.save(userAdmin)
        }
        if (cabinetRepository.count() == 0L) {
            val cabinet = Cabinet(
                description = "White and Red Cabinet",
                status = CabinetStatus.CLOSED,
                location = "Sector 2"
            )
            cabinetRepository.save(cabinet)
        }
    }
}

