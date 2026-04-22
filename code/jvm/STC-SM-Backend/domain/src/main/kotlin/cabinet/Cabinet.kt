package cabinet

data class Cabinet(
    val id: Int,
    val description: String,
    val status: CabinetStatus,
    val location: String // For now a text but can be a class in the future, for scalability cases
)
