package pt.isel.errors

sealed class AlertError {
    data object AlertsNotFound : AlertError()
}