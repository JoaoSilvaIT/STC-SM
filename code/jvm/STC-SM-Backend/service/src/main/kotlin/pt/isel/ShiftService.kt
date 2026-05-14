package pt.isel

import pt.isel.errors.ShiftError
import org.springframework.stereotype.Component
import pt.isel.shift.Shift
import pt.isel.user.UserRepository
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
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
