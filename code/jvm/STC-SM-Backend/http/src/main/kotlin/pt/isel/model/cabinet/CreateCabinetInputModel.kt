package pt.isel.model.cabinet

import pt.isel.cabinet.CabinetStatus

data class CreateCabinetInputModel(
    val description: String,
    val status: CabinetStatus,
    val location: String
)