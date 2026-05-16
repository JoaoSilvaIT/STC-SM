package pt.isel

import pt.isel.errors.ShiftError
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.shift.Shift
import pt.isel.user.UserRepository
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Instant

@Service
class ShiftService(
    private val shiftRepo: ShiftRepository,
    private val userRepo: UserRepository,
    private val cabinetRepo: CabinetRepository,
) {
    fun getShift(sid: Int): Either<ShiftError, Shift> {
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)
        return success(shift)
    }

    @Transactional
    fun createShift(uid: Int, cid: Int, startTime: Instant, endTime: Instant): Either<ShiftError, Shift> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        val cabinet = cabinetRepo.findByIdOrNull(cid) ?: return failure(ShiftError.InvalidCabinetId)

        if (startTime.isAfter(endTime)) return failure(ShiftError.InvalidTimeRange)

        return success(
            shiftRepo.save(
                Shift(
                    user = user,
                    cabinet = cabinet,
                    startTime = startTime,
                    endTime = endTime,
                )
            )
        )
    }

    @Transactional
    fun deleteShift(sid: Int): Either<ShiftError, Unit> {
        shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)
        shiftRepo.deleteById(sid)
        return success(Unit)
    }
}
