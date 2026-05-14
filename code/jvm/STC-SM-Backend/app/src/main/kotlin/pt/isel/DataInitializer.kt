package pt.isel

import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import pt.isel.profile.Profile
import pt.isel.profile.Role

@Component
class DataInitializer(
    private val profileRepository: ProfileRepository
) : CommandLineRunner {
    override fun run(vararg args: String?) {
        // Load initial profiles if they don't exist
        if (profileRepository.count() == 0L) {
            val profiles = listOf(
                Profile(id = 1, role = Role.MECHANIC, description = "Mechanic"),
                Profile(id = 2, role = Role.BACK_OFFICE, description = "Back Office"),
                Profile(id = 3, role = Role.ADMIN, description = "Administrator")
            )
            profileRepository.saveAll(profiles)
        }
    }
}

