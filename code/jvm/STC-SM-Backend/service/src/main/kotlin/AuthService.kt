import auth.Token
import auth.TokenDomainConfig
import auth.TokenEncoder
import auth.TokenExternalInfo
import errors.UserError
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import user.TokenRepository
import user.User
import user.UserRepository
import utils.Either
import utils.failure
import utils.success
import java.security.SecureRandom
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.Base64.getUrlDecoder
import java.util.Base64.getUrlEncoder
import kotlin.compareTo

@Service
class AuthService(
    private val passwordEncoder: PasswordEncoder,
    private val userRepo: UserRepository,
    private val tokenRepo: TokenRepository,
    private val clock: Clock,
    private val config: TokenDomainConfig,
    private val tokenEncoder: TokenEncoder
) {
    @Transactional
    fun login(email: String, password: String): Either<UserError, TokenExternalInfo> {
        val user = userRepo.findByEmail(email.trim())
            ?: return failure(UserError.UserNotFoundOrInvalidCredentials)

        if (!passwordEncoder.matches(password, user.passwordValidation.hash)) {
            return failure(UserError.UserNotFoundOrInvalidCredentials)
        }

        val tokenValue = generateTokenValue()
        val now = clock.instant()

        val validationInfo = tokenEncoder.createValidationInformation(tokenValue)


        val userTokens = tokenRepo.findAllByUser(user)
        if (userTokens.size >= config.maxTokensPerUser) {
            val oldestToken = userTokens.minBy { it.lastUsedAt }
            tokenRepo.delete(oldestToken)
        }

        val newToken = Token(
            tokenValidationInfo = validationInfo,
            user = user,
            createdAt = now,
            lastUsedAt = now
        )
        tokenRepo.save(newToken)

        return success(TokenExternalInfo(tokenValue, getTokenExpiration(newToken)))
    }

    @Transactional
    fun getUserByToken(
        token: String,
    ): User? {
        if(!canBeToken(token)) {
            return null
        }

        val tokenValidationInfo = tokenEncoder.createValidationInformation(token)
        val token = tokenRepo.findByTokenValidationInfoValidationInfo(tokenValidationInfo.validationInfo)

        if (token != null && isTokenTimeValid(clock, token)) {
            val updatedToken = token.copy(lastUsedAt = clock.instant())
            tokenRepo.save(updatedToken)
            return token.user
        } else {
            return null
        }
    }

    @Transactional
    fun revokeToken(tokenValue: String): Boolean {
        val tokenValidationInfo = tokenEncoder.createValidationInformation(tokenValue)
        val token = tokenRepo.findByTokenValidationInfoValidationInfo(tokenValidationInfo.validationInfo)

        return if (token != null) {
            tokenRepo.delete(token)
            true
        } else {
            false
        }
    }

    private fun getTokenExpiration(token: Token): Instant {
        val absoluteExpiration = token.createdAt + config.tokenTtl
        val rollingExpiration = token.lastUsedAt + config.tokenRollingTtl
        return if (absoluteExpiration < rollingExpiration) {
            absoluteExpiration
        } else {
            rollingExpiration
        }
    }

    private fun generateTokenValue(): String =
        ByteArray(config.tokenSizeInBytes).let { byteArray ->
            SecureRandom.getInstanceStrong().nextBytes(byteArray)
            getUrlEncoder().encodeToString(byteArray)
        }

    private fun isTokenTimeValid(
        clock: Clock,
        token: Token,
    ): Boolean {
        val now = clock.instant()
        return token.createdAt <= now &&
                Duration.between(token.createdAt, now) <= config.tokenTtl &&
                Duration.between(token.lastUsedAt, now) <= config.tokenRollingTtl
    }

    private fun canBeToken(token: String): Boolean =
        try {
            getUrlDecoder().decode(token).size == config.tokenSizeInBytes
        } catch (ex: IllegalArgumentException) {
            false
        }
}