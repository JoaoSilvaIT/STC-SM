import errors.CabinetError
import org.springframework.stereotype.Component
import cabinet.Cabinet
import utils.Either

@Component
class CabinetService {

    fun getCabinet(id: Int): Either<CabinetError, Cabinet> {
        TODO("Implement cabinet fetching logic")
    }
}
