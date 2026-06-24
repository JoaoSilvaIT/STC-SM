package pt.isel.model.tools

import pt.isel.tools.ToolStatus

data class CreateToolInput(
    val name: String,
    val cabinetId: Int,
    val status: ToolStatus,
    val location: String,
)
