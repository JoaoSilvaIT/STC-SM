import org.springframework.stereotype.Component
import profile.Role
import user.PasswordValidationInfo
import user.Token
import user.TokenValidationInfo
import user.User


@Component
interface RepositoryUser: Repository<User> {
    fun createUser(
        name: String,
        email: String,
        password : PasswordValidationInfo,
        idProfile: Int
    )

    fun findByEmail(email: String) : User?

    fun getTokenByTokenValidationInfo(tokenValidationInfo: TokenValidationInfo): Pair<User, Token>?

    fun createToken(token: Token)

    fun removeTokenByValidationInfo(tokenValidationInfo: TokenValidationInfo): Int
}