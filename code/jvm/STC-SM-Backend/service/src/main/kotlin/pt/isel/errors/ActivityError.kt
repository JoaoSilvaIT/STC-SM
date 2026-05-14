package pt.isel.errors

sealed class ActivityError {
    data object ActivityNotFound : ActivityError()
    data object InvalidUserId: ActivityError()
    data object InvalidToolId: ActivityError()
    data object InvalidCabinetId : ActivityError()
}
