package pt.isel.user

data class UserOutputModel(
    val name: String
) {
    companion object {
        fun fromDomain(user: User): UserOutputModel =
            UserOutputModel(
                name = user.name
            )
    }
}