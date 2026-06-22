package pt.isel

import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pt.isel.errors.ShiftError
import org.springframework.transaction.annotation.Transactional
import pt.isel.activity.ActivityType
import pt.isel.events.ShiftUpdated
import pt.isel.shift.Shift
import pt.isel.shift.ShiftStatus
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Instant
import java.time.LocalDate
import pt.isel.results.ShiftResult

@Service
class ShiftService(
    private val shiftRepo: ShiftRepository,
    private val userRepo: UserRepository,
    private val cabinetRepo: CabinetRepository,
    private val alertService: AlertService,
    private val activityService: ActivityService ,
    private val eventPublisher: ApplicationEventPublisher
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

        val localDateTime = LocalDate.now()

        return success(
            shiftRepo.save(
                Shift(
                            user = user,
                            cabinet = cabinet,
                            startTime = startTime,
                            endTime = endTime,
                            status = ShiftStatus.INACTIVE,
                            lastEvaluatedDate = localDateTime)
            )
        )
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
    fun startShift(sid: Int, uid: Int): Either<ShiftError, ShiftResult> {
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        if (shift.status == ShiftStatus.ACTIVE) return failure(ShiftError.ShiftAlreadyStarted)
        val timeNow = Instant.now()
        if (timeNow.isBefore(shift.startTime) || timeNow.isAfter(shift.endTime)) return failure(ShiftError.ShiftOutOfTime)
        val today = LocalDate.now()
        activityService.createActivity(
            uid = user.id, sid = shift.id,
            tid = null,
            cid = shift.cabinet.id,
            type = ActivityType.STARTED_SHIFT,
            date = Instant.now()
        )
        val result = if (shift.lastEvaluatedDate != today) {
            val alert = alertService.evaluateLateStart(shift, user)
            val updatedShift = shiftRepo.save(shift.copy(lastEvaluatedDate = today, status = ShiftStatus.ACTIVE))
            ShiftResult(updatedShift, alert)
        } else {
            ShiftResult(shiftRepo.save(shift.copy(status = ShiftStatus.ACTIVE)), null)
        }

        eventPublisher.publishEvent(ShiftUpdated(result.shift, result.alert))

        return success(result)
    }

    @Transactional
    fun endShift(sid: Int, uid: Int): Either<ShiftError, ShiftResult> {
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        if (shift.status == ShiftStatus.INACTIVE) return failure(ShiftError.ShiftAlreadyEnded)
        activityService.createActivity(
            uid = user.id, sid = shift.id,
            tid = null,
            cid = null,
            type = ActivityType.ENDED_SHIFT,
            date = Instant.now()
        )

        val alert = alertService.evaluateEarlyEnding(shift, user)
        val updatedShift = shiftRepo.save(shift.copy(status = ShiftStatus.INACTIVE))
        val result = ShiftResult(updatedShift, alert)

        eventPublisher.publishEvent(ShiftUpdated(result.shift, result.alert))

        return success(result)
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
