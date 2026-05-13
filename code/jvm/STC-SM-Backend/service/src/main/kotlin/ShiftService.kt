import errors.ShiftError
import org.springframework.stereotype.Component
import shift.Shift
import user.ShiftRepository
import utils.Either
import utils.failure
import utils.success
import java.time.Instant

@Component
class ShiftService(private val shiftRepo: ShiftRepository) {
    fun getShift(sid: Int): Either<ShiftError, Shift> {
        return try {
            success(shiftRepo.getReferenceById(sid))
        }catch(e: Exception) {
            failure(ShiftError.ShiftNotFound)
        }
    }

    fun updateShift(id : Int): Either<ShiftError, Shift> {
        TODO()
    }

    fun createShift(uid: Int, cid: Int, startTime: Instant, endTime: Instant): Either<ShiftError, Shift> {
        TODO()
    }
}
