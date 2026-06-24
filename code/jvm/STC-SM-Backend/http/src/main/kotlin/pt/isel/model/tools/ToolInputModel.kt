package pt.isel.model.tools

import pt.isel.tools.ToolStatus

data class ToolInputModel(
    val status: ToolStatus,
    val toolId: Int,
    val userId: Int,
)
