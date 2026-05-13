import errors.CabinetError
import org.springframework.stereotype.Component
import cabinet.Cabinet
import cabinet.CabinetStatus
import org.springframework.data.repository.findByIdOrNull
import user.CabinetRepository
import utils.Either
import utils.failure
import utils.success

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
