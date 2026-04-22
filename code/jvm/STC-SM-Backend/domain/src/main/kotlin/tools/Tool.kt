package tools

data class Tool(
    val id: Int,
    val name: String,
    val idCabinet: Int,
    val status: ToolStatus,
    val location: String, // Same as the cabinet
)
