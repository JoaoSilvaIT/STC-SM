package pt.isel.errors

sealed class AlertError {
    data object AlertsNotFound : AlertError()
    data object AlertNotFound : AlertError()
    data object CabinetNotFound : AlertError()
}