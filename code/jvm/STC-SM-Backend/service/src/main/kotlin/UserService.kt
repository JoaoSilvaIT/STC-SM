import errors.UserError
import org.springframework.stereotype.Component
import user.User
import user.UserRepository
import utils.Either
import utils.failure
import utils.success


@Component
class UserService(private val userRepo: UserRepository) {

    fun getUser(id: Int): Either<UserError, User> {
        val user = userRepo.findById(id).orElse(null)
        return if (user != null) {
            success(user)
        } else {
            failure(UserError.UserNotFoundOrInvalidCredentials)
        }
    }
}