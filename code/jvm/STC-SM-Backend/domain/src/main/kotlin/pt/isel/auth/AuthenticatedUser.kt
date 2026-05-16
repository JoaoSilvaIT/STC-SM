package pt.isel.auth

import pt.isel.user.User

data class AuthenticatedUser(
    val user: User,
    val token: String,
)
