import errors.UserError
import org.springframework.stereotype.Component
import user.User
import utils.Either
import utils.success


@Component
class UserService {

    fun getUser(id:Int): Either<UserError, User> {
        TODO()

    }
}