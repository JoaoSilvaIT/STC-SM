package auth

import user.User

data class AuthenticatedUser(
    val user: User,
    val token: String,
)
