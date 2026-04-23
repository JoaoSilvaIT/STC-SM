package profile

data class Profile(
    val id: Int,
    val role: Role, // This also defines the access level of the app itself
    val description: String
)
