import org.springframework.stereotype.Component
import auth.PasswordValidationInfo
import user.User

@Component
interface UserRepository: Repository<User> {
    fun createUser(
        name: String,
        email: String,
        password : PasswordValidationInfo,
        idProfile: Int
    )

    fun findByEmail(email: String) : User?
}
