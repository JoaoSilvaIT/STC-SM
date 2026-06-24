package pt.isel.auth

import java.time.Duration

data class TokenDomainConfig(
    val tokenSizeInBytes: Int,
    val accessTokenExpiration: Duration,
    val refreshTokenExpiration: Duration,
    val minPasswordLength: Int,
) {
    init {
        require(tokenSizeInBytes > 0)
        require(minPasswordLength > 0)
    }
}
