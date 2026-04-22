package profile

data class Profile(
    val role: Role, // This also defines the access level of the app itself
    val description: String
)
