import errors.UserError
import org.springframework.stereotype.Component
import user.User
import user.UserRepository
import utils.Either
import utils.failure
import utils.success
import auth.PasswordValidationInfo
import org.springframework.data.repository.findByIdOrNull
import user.ProfileRepository
import user.UserStatus

@Component
class UserService(private val userRepo: UserRepository, private val profileRepo: ProfileRepository) {

    fun getUser(uid: Int): Either<UserError, User> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(UserError.UserNotFoundOrInvalidCredentials)
        return success(user)
    }

    fun createUser(name: String, email: String, password: String, pid: Int): Either<UserError, User> {
        val emailTrimmed = email.trim()

        if(userRepo.findByEmail(emailTrimmed) != null) {
            return failure(UserError.EmailAlreadyInUse)
        }

        val profile = profileRepo.findByIdOrNull(pid) ?: return failure(UserError.UserNotFoundOrInvalidCredentials)

        val newUser = User(
            name = name,
            email = emailTrimmed,
            profile = profile,
            status = UserStatus.ACTIVE,
            passwordValidation = PasswordValidationInfo(password)
        )

        return success(userRepo.save(newUser))
    }

    fun deleteUser(uid: Int): Either<UserError, Unit> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(
            UserError.UserNotFoundOrInvalidCredentials
        )
        userRepo.delete(user)
        return success(Unit)
    }
}