package errors

sealed class ShiftError {
    data object ShiftNotFound : ShiftError()
    data object InvalidTimeRange : ShiftError()
    data object InvalidUserId : ShiftError()
    data object InvalidCabinetId : ShiftError()
}
