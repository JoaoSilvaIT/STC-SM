package errors

sealed class ShiftError {
    data object ShiftNotFound : ShiftError()
    data object InvalidTimeRange : ShiftError()
}
