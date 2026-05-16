package pt.isel

import pt.isel.errors.CabinetError
import org.springframework.stereotype.Component
import org.springframework.data.repository.findByIdOrNull
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success

@Component
class CabinetService(private val cabinetRepo: CabinetRepository) {

    fun getCabinet(id: Int): Either<CabinetError, Cabinet> {
        val cabinet = cabinetRepo.findByIdOrNull(id)?: return failure(CabinetError.CabinetNotFound)
        return success(cabinet)
    }

    fun updateCabinet(status: CabinetStatus, cid: Int): Either<CabinetError, Cabinet> {
        val cabinet = cabinetRepo.findByIdOrNull(cid)?: return failure(CabinetError.CabinetNotFound)

        return success(cabinetRepo.saveAndFlush(
            cabinet.copy(
                status = status
            )))
    }

}
