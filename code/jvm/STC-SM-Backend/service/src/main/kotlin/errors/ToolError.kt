package errors

sealed class ToolError {
    data object ToolNotFound : ToolError()
    data object ToolNotActive : ToolError()
}
