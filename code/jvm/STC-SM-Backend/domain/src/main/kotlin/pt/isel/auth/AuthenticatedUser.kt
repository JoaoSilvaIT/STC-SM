package pt.isel.auth

import pt.isel.user.User

data class AuthenticatedUser(
    val user: pt.isel.user.User,
    val token: String,
)
