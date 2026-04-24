import profile.Profile
import org.springframework.stereotype.Component

@Component
interface ProfileRepository : Repository<Profile> {
    // Add specific queries for Profile if needed later
}
