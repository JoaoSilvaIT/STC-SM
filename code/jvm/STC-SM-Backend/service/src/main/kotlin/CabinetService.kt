import errors.CabinetError
import org.springframework.stereotype.Component
import cabinet.Cabinet
import cabinet.CabinetStatus
import utils.Either

@Component
class CabinetService {

    fun getCabinet(id: Int): Either<CabinetError, Cabinet> {
        TODO("Implement cabinet fetching logic")
    }

    fun updateCabinet(status: CabinetStatus, id: Int): Either<CabinetError, Cabinet> {
        TODO()
    }
}
