package pt.isel.model.cabinet

import pt.isel.cabinet.CabinetStatus

data class CabinetInputModel(
    val status: CabinetStatus,
    val cabinetId: Int,
    val userId: Int,
)
