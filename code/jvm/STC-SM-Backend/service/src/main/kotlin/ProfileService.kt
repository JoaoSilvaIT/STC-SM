import errors.ProfileError
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import profile.Profile
import user.ProfileRepository
import utils.Either
import utils.failure
import utils.success

@Component
class ProfileService(private val profileRepo: ProfileRepository,) {

    fun getProfile(pid: Int): Either<ProfileError, Profile> {
        val profile = profileRepo.findByIdOrNull(pid) ?: return failure(ProfileError.ProfileNotFound)
        return success(profile)
    }
}
