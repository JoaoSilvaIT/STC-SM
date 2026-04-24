package errors

sealed class ActivityError {
    data object ActivityNotFound : ActivityError()
}
