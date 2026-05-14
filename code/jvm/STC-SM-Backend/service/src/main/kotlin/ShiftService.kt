import errors.ShiftError
import org.springframework.stereotype.Component
import shift.Shift
import user.CabinetRepository
import user.ShiftRepository
import user.UserRepository
import utils.Either
import utils.failure
import utils.success
import java.time.Instant

@Component
class ShiftService(private val shiftRepo: ShiftRepository, private val userRepo: UserRepository, private val cabinetRepo: CabinetRepository) {
    fun getShift(sid: Int): Either<ShiftError, Shift> {
        val shift = shiftRepo.findById(sid).orElse(null)
        return if (shift != null) success(shift) else failure(ShiftError.ShiftNotFound)
    }

    fun createShift(uid: Int, cid: Int, startTime: Instant, endTime: Instant): Either<ShiftError, Shift> {
        val user = userRepo.findById(uid).orElse(null) ?: return failure(ShiftError.InvalidUserId)
        val cabinet = cabinetRepo.findById(cid).orElse(null) ?: return failure(ShiftError.InvalidCabinetId)

        if(startTime.isAfter(endTime)) return failure(ShiftError.InvalidTimeRange)

        return success(
            shiftRepo.save(
            Shift(
            user = user,
            cabinet = cabinet,
            startTime = startTime,
            endTime = endTime
        )))
    }

    fun deleteShift(sid: Int): Either<ShiftError, Unit> {
        shiftRepo.findById(sid).orElse(null) ?: return failure(ShiftError.ShiftNotFound)
        shiftRepo.deleteById(sid)
        return success(Unit)
    }
}
