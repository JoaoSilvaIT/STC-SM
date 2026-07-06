package pt.isel.errors

sealed class ToolError {
    data object ToolNotFound : ToolError()

    data object ToolNotActive : ToolError()

    data object InvalidName : ToolError()

    data object InvalidLocation : ToolError()

    data object InvalidCabinet : ToolError()

    data object UserNotFound : ToolError()

    data object NotAuthorized : ToolError()
}
