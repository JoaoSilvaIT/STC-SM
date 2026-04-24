import org.springframework.stereotype.Component
import auth.Token
import auth.TokenValidationInfo
import user.User

@Component
interface TokenRepository: Repository<Token> {
    fun getTokenByTokenValidationInfo(tokenValidationInfo: TokenValidationInfo): Pair<User, Token>?

    fun createToken(token: Token)

    fun removeTokenByValidationInfo(tokenValidationInfo: TokenValidationInfo): Int
}
