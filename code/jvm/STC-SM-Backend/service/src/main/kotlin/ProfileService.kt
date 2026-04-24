import errors.ProfileError
import org.springframework.stereotype.Component
import profile.Profile
import utils.Either

@Component
class ProfileService {

    fun getProfile(id: Int): Either<ProfileError, Profile> {
        TODO("Implement profile fetching logic")
    }
}
