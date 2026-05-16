package pt.isel.auth

data class TokensOutput(
    val accessToken: String,
    val refreshToken: String,
)
