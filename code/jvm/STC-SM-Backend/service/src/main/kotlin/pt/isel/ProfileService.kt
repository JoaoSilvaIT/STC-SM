package pt.isel

import pt.isel.errors.ProfileError
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pt.isel.profile.Profile
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success

@Service
class ProfileService(private val profileRepo: ProfileRepository) {

    fun getProfile(pid: Int): Either<ProfileError, Profile> {
        val profile = profileRepo.findByIdOrNull(pid) ?: return failure(ProfileError.ProfileNotFound)
        return success(profile)
    }
}
