package pt.isel.errors

sealed class ShiftError {
    data object ShiftNotFound : ShiftError()
    data object InvalidTimeFormat : ShiftError()
    data object InvalidUserId : ShiftError()
    data object InvalidCabinetId : ShiftError()
    data object NotAuthorized : ShiftError()
    data object ShiftAlreadyStarted : ShiftError()
    data object ShiftAlreadyEnded : ShiftError()
    data object ShiftOutOfTime : ShiftError()
}
