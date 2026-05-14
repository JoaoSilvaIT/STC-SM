package pt.isel.errors

sealed class ToolError {
    data object ToolNotFound : ToolError()
    data object ToolNotActive : ToolError()
}
