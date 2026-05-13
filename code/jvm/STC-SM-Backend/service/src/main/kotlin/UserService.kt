import errors.UserError
import org.springframework.stereotype.Component
import user.User
import user.UserRepository
import utils.Either
import utils.failure
import utils.success
import auth.PasswordValidationInfo
import user.ProfileRepository
import user.UserStatus

@Component
class UserService(private val userRepo: UserRepository, private val profileRepo: ProfileRepository) {

    fun getUser(id: Int): Either<UserError, User> {
        val user = userRepo.findById(id).orElse(null)
        return if (user != null) {
            success(user)
        } else {
            failure(UserError.UserNotFoundOrInvalidCredentials)
        }
    }

    fun createUser(name: String, email: String, password: String, profile: Int): Either<UserError, User> {
        val emailTrimmed = email.trim()

        if(userRepo.findByEmail(emailTrimmed) != null) {
            return failure(UserError.EmailAlreadyInUse)
        }

        val profile = profileRepo.getReferenceById(profile)

        val newUser = User(
            name = name,
            email = emailTrimmed,
            profile = profile,
            status = UserStatus.ACTIVE,
            passwordValidation = PasswordValidationInfo(password)
        )

        return success(userRepo.save(newUser))
    }

    fun deleteUser(id: Int): Either<UserError, Unit> {
        val user = userRepo.findById(id).orElse(null) ?: return failure(
            UserError.UserNotFoundOrInvalidCredentials
        )
        userRepo.delete(user)
        return success(Unit)
    }
}