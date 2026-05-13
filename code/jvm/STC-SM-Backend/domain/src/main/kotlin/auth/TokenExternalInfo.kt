package auth

import java.time.Instant

data class TokenExternalInfo(
    val tokenValue: String,
    val tokenExpiration: Instant,
)
