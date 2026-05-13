import errors.ProfileError
import org.springframework.stereotype.Component
import profile.Profile
import user.ProfileRepository
import utils.Either
import utils.failure
import utils.success

@Component
class ProfileService(private val profileRepo: ProfileRepository,) {

    fun getProfile(id: Int): Either<ProfileError, Profile> {
        return try {
            success(profileRepo.getReferenceById(id))
        }catch (e:Exception){
            failure(ProfileError.ProfileNotFound)
        }
    }
}
