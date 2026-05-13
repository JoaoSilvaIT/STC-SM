import errors.ShiftError
import org.springframework.stereotype.Component
import shift.Shift
import utils.Either
import java.time.Instant

@Component
class ShiftService {
    fun getShift(id: Int): Either<ShiftError, Shift> {
        TODO("Implement shift fetching logic")
    }

    fun updateShift(id : Int): Either<ShiftError, Shift> {
        TODO()
    }

    fun createShift(uid: Int, cid: Int, startTime: Instant, endTime: Instant): Either<ShiftError, Shift> {
        TODO()
    }
}
