package model.user

import profile.Profile

data class UserInput (
    val userName: String,
    val email: String,
    val password: String,
    val profile: Int
)