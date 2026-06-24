package pt.isel
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.auth.TokenDomainConfig
import pt.isel.auth.TokenEncoder
import pt.isel.auth.TokensOutput
import pt.isel.auth.UserSession
import pt.isel.errors.UserError
import pt.isel.user.User
import pt.isel.user.UserStatus
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.security.SecureRandom
import java.time.Clock
import java.util.Base64.getUrlDecoder
import java.util.Base64.getUrlEncoder

@Service
class AuthService(
    private val passwordEncoder: PasswordEncoder,
    private val userRepo: UserRepository,
    private val sessionRepository: UserSessionRepository,
    private val clock: Clock,
    private val config: TokenDomainConfig,
    private val tokenEncoder: TokenEncoder,
) {
    @Transactional
    fun login(
        email: String,
        password: String,
    ): Either<UserError, TokensOutput> {
        val user =
            userRepo.findByEmail(email.trim())
                ?: return failure(UserError.UserNotFoundOrInvalidCredentials)

        if (!passwordEncoder.matches(password, user.passwordValidation.hash)) {
            return failure(UserError.UserNotFoundOrInvalidCredentials)
        }

        // Deactivated accounts cannot authenticate. Reuse the generic credentials error
        // so we do not reveal that the account exists but is disabled.
        if (user.status != UserStatus.ACTIVE) {
            return failure(UserError.UserNotFoundOrInvalidCredentials)
        }

        // Generate a random Token
        val accessTokenValue = generateTokenValue()
        val refreshTokenValue = generateTokenValue()

        // Encode that random Token
        val validationInfoAccess = tokenEncoder.createValidationInformation(accessTokenValue)
        val validationInfoRefresh = tokenEncoder.createValidationInformation(refreshTokenValue)

        val now = clock.instant()

        val session =
            UserSession(
                accessToken = validationInfoAccess,
                refreshToken = validationInfoRefresh,
                accessTokenExpiresAt = now.plus(config.accessTokenExpiration),
                refreshTokenExpiresAt = now.plus(config.refreshTokenExpiration),
                user = user,
            )

        sessionRepository.save(session)

        return success(TokensOutput(accessTokenValue, refreshTokenValue))
    }

    @Transactional
    fun getUserByToken(token: String): User? {
        if (!canBeToken(token)) {
            return null
        }

        val tokenValidationInfo = tokenEncoder.createValidationInformation(token)

        val session = sessionRepository.findByAccessTokenValidationInfo(tokenValidationInfo.validationInfo) ?: return null

        if (session.accessTokenExpiresAt.isBefore(clock.instant())) {
            return null
        }

        return session.user
    }

    @Transactional
    fun revokeToken(tokenValue: String): Boolean {
        val tokenValidationInfo = tokenEncoder.createValidationInformation(tokenValue)

        val session = sessionRepository.findByAccessTokenValidationInfo(tokenValidationInfo.validationInfo)

        return if (session != null) {
            sessionRepository.delete(session)
            true
        } else {
            false
        }
    }

    @Transactional
    fun refreshToken(tokenValue: String): Either<UserError, String> {
        // Just to check if is not a fake token to optimize stupid processing
        if (!canBeToken(tokenValue)) {
            return failure(UserError.UserNotFoundOrInvalidCredentials)
        }

        val token = tokenEncoder.createValidationInformation(tokenValue)

        val session =
            sessionRepository.findByRefreshTokenValidationInfo(token.validationInfo)
                ?: return failure(UserError.UserNotFoundOrInvalidCredentials)

        val now = clock.instant()

        if (session.refreshTokenExpiresAt.isBefore(now)) {
            // If the refresh Token expired forces the logout
            sessionRepository.delete(session)
            return failure(UserError.UserNotFoundOrInvalidCredentials)
        }

        // Generates a new access token
        val accessTokenValue = generateTokenValue()
        val accessToken = tokenEncoder.createValidationInformation(accessTokenValue)

        val updatedSession =
            session.copy(
                accessToken = accessToken,
                accessTokenExpiresAt = now.plus(config.accessTokenExpiration),
            )

        sessionRepository.save(updatedSession)

        return success(accessTokenValue)
    }

    private val secureRandom: SecureRandom = SecureRandom.getInstanceStrong()

    private fun generateTokenValue(): String =
        ByteArray(config.tokenSizeInBytes).let { byteArray ->
            secureRandom.nextBytes(byteArray)
            getUrlEncoder().encodeToString(byteArray)
        }

    private fun canBeToken(token: String): Boolean =
        try {
            getUrlDecoder().decode(token).size == config.tokenSizeInBytes
        } catch (ex: IllegalArgumentException) {
            false
        }
}
