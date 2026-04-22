package user

import profile.Profile

data class User (
    val id: Int,
    val name: String,
    val email: String,
    val profile : Profile,
    val status: UserStatus,
    val passwordValidation: PasswordValidationInfo
)