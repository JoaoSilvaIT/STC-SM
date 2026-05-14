package model.user

import user.User

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