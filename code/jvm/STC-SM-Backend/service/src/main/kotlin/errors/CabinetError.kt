package errors

sealed class CabinetError {
    data object CabinetNotFound : CabinetError()
    data object InvalidCabinetStatus : CabinetError()
}
