package pt.isel.errors

sealed class CabinetError {
    data object CabinetNotFound : CabinetError()

    data object InvalidCabinetStatus : CabinetError()

    data object InvalidLocation : CabinetError()

    data object InvalidDescription : CabinetError()

    data object UserNotFound : CabinetError()
}
