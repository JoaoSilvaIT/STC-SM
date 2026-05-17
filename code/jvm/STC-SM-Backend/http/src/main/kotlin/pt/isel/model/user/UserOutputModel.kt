package pt.isel.model.user

import pt.isel.user.User

data class UserOutputModel(
    val name: String,
    val email: String,
    val role: String,
    val status: String,
    val self: String,
) {
    companion object {
        fun fromDomain(user: User): UserOutputModel =
            UserOutputModel(
                name = user.name,
                email = user.email,
                role = user.profile.role.name,
                status = user.status.name,
                self = "/api/users/${user.id}",
            )
    }
}
