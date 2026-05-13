import errors.CabinetError
import org.springframework.stereotype.Component
import cabinet.Cabinet
import cabinet.CabinetStatus
import user.CabinetRepository
import utils.Either
import utils.failure
import utils.success

@Component
class CabinetService(private val cabinetRepo: CabinetRepository) {

    fun getCabinet(id: Int): Either<CabinetError, Cabinet> {
        val cabinet = cabinetRepo.findById(id).orElse(null)
        return if (cabinet != null) success(cabinet) else failure(CabinetError.CabinetNotFound)
    }

    fun updateCabinet(status: CabinetStatus, id: Int): Either<CabinetError, Cabinet> {
        TODO()
    }
}
