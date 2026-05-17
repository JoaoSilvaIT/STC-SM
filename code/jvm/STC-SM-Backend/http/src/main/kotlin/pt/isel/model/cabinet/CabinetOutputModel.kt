package pt.isel.model.cabinet

import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus

data class CabinetOutputModel(
    val description: String,
    val status: CabinetStatus,
    val location: String,
    val self: String,
) {
    companion object {
        fun fromDomain(cabinet: Cabinet): CabinetOutputModel =
            CabinetOutputModel(
                description = cabinet.description,
                status = cabinet.status,
                location = cabinet.location,
                self = "/api/cabinets/${cabinet.id}",
            )
    }
}
