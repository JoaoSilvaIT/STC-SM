package pt.isel.errors

sealed class CabinetError {
    data object CabinetNotFound : CabinetError()
    data object InvalidCabinetStatus : CabinetError()
}
