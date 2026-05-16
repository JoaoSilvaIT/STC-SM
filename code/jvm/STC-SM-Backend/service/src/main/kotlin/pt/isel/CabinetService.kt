package pt.isel

import pt.isel.errors.CabinetError
import org.springframework.stereotype.Service
import org.springframework.data.repository.findByIdOrNull
import org.springframework.transaction.annotation.Transactional
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success

@Service
class CabinetService(private val cabinetRepo: CabinetRepository) {

    fun getCabinet(id: Int): Either<CabinetError, Cabinet> {
        val cabinet = cabinetRepo.findByIdOrNull(id) ?: return failure(CabinetError.CabinetNotFound)
        return success(cabinet)
    }

    @Transactional
    fun updateCabinet(status: CabinetStatus, cid: Int): Either<CabinetError, Cabinet> {
        val cabinet = cabinetRepo.findByIdOrNull(cid) ?: return failure(CabinetError.CabinetNotFound)

        return success(cabinetRepo.saveAndFlush(cabinet.copy(status = status)))
    }
}
