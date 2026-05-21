package pt.isel

import org.springframework.data.jpa.domain.AbstractPersistable_.id
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pt.isel.errors.ShiftError
import org.springframework.transaction.annotation.Transactional
import pt.isel.activity.ActivityType
import pt.isel.shift.Shift
import pt.isel.shift.ShiftStatus
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Instant

@Service
class ShiftService(
    private val shiftRepo: ShiftRepository,
    private val userRepo: UserRepository,
    private val cabinetRepo: CabinetRepository,
    private val activityService: ActivityService ,
) {
    fun getShift(sid: Int): Either<ShiftError, Shift> {
        val shift = shiftRepo.findById(sid).orElse(null)
        return if (shift != null) success(shift) else failure(ShiftError.ShiftNotFound)
    }

    fun getAllShifts(): List<Shift> = shiftRepo.findAll()

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
            endTime = endTime,
                status = ShiftStatus.ENDED // the only person that turns this into ON_GOING is the mechanic when he starts the shift itself
        )))
    }

    @Transactional
    fun editShiftHours(sid: Int, startTime: String? = null, endTime: String? = null): Either<ShiftError, Shift> {
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)

        val startTime = if (startTime == null) shift.startTime else startTime.toInstantOrNull()
        val endTime = if (endTime == null) shift.endTime else endTime.toInstantOrNull()

        if (startTime == null || endTime == null) return failure(ShiftError.InvalidTimeFormat)

        val updatedShift = shift.copy(startTime = startTime, endTime = endTime)
        return success(shiftRepo.save(updatedShift))
    }

    @Transactional
    fun startShift(sid: Int, uid: Int): Either<ShiftError, Shift> {
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        if (shift.status == ShiftStatus.ON_GOING) return failure(ShiftError.ShiftAlreadyStarted)
        activityService.createActivity(
            uid = user.id, sid = shift.id,
            tid = null,
            cid = null,
            type = ActivityType.STARTED_SHIFT,
            date = Instant.now()
        )
        return success(shiftRepo.save(shift.copy(status = ShiftStatus.ON_GOING)))
    }

    @Transactional
    fun endShift(sid: Int, uid: Int): Either<ShiftError, Shift> {
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        if (shift.status == ShiftStatus.ENDED) return failure(ShiftError.ShiftAlreadyEnded)
        activityService.createActivity(
            uid = user.id, sid = shift.id,
            tid = null,
            cid = null,
            type = ActivityType.ENDED_SHIFT,
            date = Instant.now()
        )
        return success(shiftRepo.save(shift.copy(status = ShiftStatus.ENDED)))
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
