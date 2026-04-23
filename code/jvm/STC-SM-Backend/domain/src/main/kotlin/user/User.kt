package user

data class User (
    val id: Int,
    val name: String,
    val email: String,
    val idProfile : Int,
    val status: UserStatus,
    val passwordValidation: PasswordValidationInfo
)