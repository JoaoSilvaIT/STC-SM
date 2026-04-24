import errors.ShiftError
import org.springframework.stereotype.Component
import shift.Shift
import utils.Either

@Component
class ShiftService {

    fun getShift(id: Int): Either<ShiftError, Shift> {
        TODO("Implement shift fetching logic")
    }
}
