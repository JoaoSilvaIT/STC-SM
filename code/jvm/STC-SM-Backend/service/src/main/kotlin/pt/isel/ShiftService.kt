package pt.isel

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pt.isel.errors.ShiftError
import org.springframework.transaction.annotation.Transactional
import pt.isel.shift.Shift
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success

@Service
class ShiftService(private val shiftRepo: ShiftRepository, private val userRepo: UserRepository, private val cabinetRepo: CabinetRepository) {
    fun findShiftById(sid: Int): Either<ShiftError, Shift> {
        val shift = shiftRepo.findById(sid).orElse(null)
        return if (shift != null) success(shift) else failure(ShiftError.ShiftNotFound)
    }

    @Transactional
    fun createShift(uid: Int, cid: Int, startTime: String, endTime: String): Either<ShiftError, Shift> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        val cabinet = cabinetRepo.findById(cid).orElse(null) ?: return failure(ShiftError.InvalidCabinetId)

        val startTime = startTime.toInstantOrNull() ?: return failure(ShiftError.InvalidTimeFormat)
        val endTime = endTime.toInstantOrNull() ?: return failure(ShiftError.InvalidTimeFormat)

        return success(
            shiftRepo.save(
            Shift(
            user = user,
            cabinet = cabinet,
            startTime = startTime,
            endTime = endTime
        )))
    }

    fun findAllShifts(): Either<ShiftError, List<Shift>> {
        val shifts = shiftRepo.findAll()
        return if (shifts.isEmpty()) {
            failure(ShiftError.ShiftNotFound)
        } else {
            success(shifts)
        }
    }

    fun findShiftsByCabinet(cid: Int): Either<ShiftError, List<Shift>> {
        val cabinet = cabinetRepo.findByIdOrNull(cid) ?: return failure(ShiftError.InvalidCabinetId)
        val shifts = shiftRepo.findByCabinet(cabinet)
        return if(shifts.isEmpty()) failure(ShiftError.ShiftNotFound) else success(shifts)
    }

    fun findShiftsByUser(uid: Int): Either<ShiftError, List<Shift>> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        val shifts = shiftRepo.findByUser(user)
        return if(shifts.isEmpty()) failure(ShiftError.ShiftNotFound) else success(shifts)
    }
}
