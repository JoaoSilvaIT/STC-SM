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
        val shift = shiftRepo.findById(sid).orElse(null)
        return if (shift != null) success(shift) else failure(ShiftError.ShiftNotFound)
    }

    fun updateShift(id : Int): Either<ShiftError, Shift> {
        TODO()
    }

    fun createShift(uid: Int, cid: Int, startTime: Instant, endTime: Instant): Either<ShiftError, Shift> {
        TODO()
    }
}
