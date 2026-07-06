package pt.isel

import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.activity.ActivityType
import pt.isel.errors.ShiftError
import pt.isel.events.ShiftUpdated
import pt.isel.profile.Role
import pt.isel.results.ShiftResult
import pt.isel.shift.Shift
import pt.isel.user.User
import pt.isel.shift.ShiftStatus
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime

@Service
class ShiftService(
    private val shiftRepo: ShiftRepository,
    private val userRepo: UserRepository,
    private val cabinetRepo: CabinetRepository,
    private val alertService: AlertService,
    private val activityService: ActivityService,
    private val eventPublisher: ApplicationEventPublisher,
) {
    fun getShift(sid: Int): Either<ShiftError, Shift> {
        val shift = shiftRepo.findByIdOrNull(sid)
        return if (shift != null) success(shift) else failure(ShiftError.ShiftNotFound)
    }

    fun getAllShifts(): List<Shift> = shiftRepo.findAll()

    fun getUnassignedMechanics(actor: User): Either<ShiftError, List<User>> {
        if (actor.profile.role != Role.BACK_OFFICE) return failure(ShiftError.NotAuthorized)
        val assignedUserIds = shiftRepo.findAll().map { it.user.id }.toSet()
        return success(
            userRepo.findAll().filter { it.profile.role == Role.MECHANIC && it.id !in assignedUserIds },
        )
    }

    @Transactional
    fun createShift(
        uid: Int,
        cid: Int,
        startTime: String,
        endTime: String,
        actor: User,
    ): Either<ShiftError, Shift> {
        if (actor.profile.role != Role.BACK_OFFICE) return failure(ShiftError.NotAuthorized)
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        val cabinet = cabinetRepo.findByIdOrNull(cid) ?: return failure(ShiftError.InvalidCabinetId)

        val startTime = startTime.toLocalTimeOrNull() ?: return failure(ShiftError.InvalidTimeFormat)
        val endTime = endTime.toLocalTimeOrNull() ?: return failure(ShiftError.InvalidTimeFormat)
        if (!endTime.isAfter(startTime)) return failure(ShiftError.InvalidTimeRange)

        val today = LocalDate.now()

        return success(
            shiftRepo.save(
                Shift(
                    user = user,
                    cabinet = cabinet,
                    startTime = startTime,
                    endTime = endTime,
                    status = ShiftStatus.INACTIVE,
                    lastEvaluatedDate = today,
                ),
            ),
        )
    }

    @Transactional
    fun editShiftHours(
        sid: Int,
        startTime: String? = null,
        endTime: String? = null,
        actor: User,
    ): Either<ShiftError, Shift> {
        if (actor.profile.role != Role.BACK_OFFICE) return failure(ShiftError.NotAuthorized)
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)

        val startTime =
            if (startTime == null) {
                shift.startTime
            } else {
                startTime.toLocalTimeOrNull() ?: return failure(ShiftError.InvalidTimeFormat)
            }
        val endTime =
            if (endTime == null) {
                shift.endTime
            } else {
                endTime.toLocalTimeOrNull() ?: return failure(ShiftError.InvalidTimeFormat)
            }

        if (!endTime.isAfter(startTime)) return failure(ShiftError.InvalidTimeRange)

        val updatedShift = shift.copy(startTime = startTime, endTime = endTime)
        return success(shiftRepo.save(updatedShift))
    }

    @Transactional
    fun startShift(
        sid: Int,
        uid: Int,
    ): Either<ShiftError, ShiftResult> {
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        if (shift.status == ShiftStatus.ACTIVE) return failure(ShiftError.ShiftAlreadyStarted)
        if (hasActiveShift(shift.cabinet.id)) return failure(ShiftError.ShiftAlreadyHappening)
        val timeNow = LocalTime.now()
        if (timeNow.isBefore(shift.startTime) || timeNow.isAfter(shift.endTime)) return failure(ShiftError.ShiftOutOfTime)
        val today = LocalDate.now()
        activityService.createActivity(
            uid = user.id,
            sid = shift.id,
            tid = null,
            cid = shift.cabinet.id,
            type = ActivityType.STARTED_SHIFT,
            date = Instant.now(),
        )
        val result =
            if (shift.lastEvaluatedDate != today) {
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
    fun endShift(
        sid: Int,
        uid: Int,
    ): Either<ShiftError, ShiftResult> {
        val shift = shiftRepo.findByIdOrNull(sid) ?: return failure(ShiftError.ShiftNotFound)
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        if (shift.status == ShiftStatus.INACTIVE) return failure(ShiftError.ShiftAlreadyEnded)
        activityService.createActivity(
            uid = user.id,
            sid = shift.id,
            tid = null,
            cid = null,
            type = ActivityType.ENDED_SHIFT,
            date = Instant.now(),
        )

        val alert = alertService.evaluateEarlyEnding(shift, user)
        val updatedShift = shiftRepo.save(shift.copy(status = ShiftStatus.INACTIVE))
        val result = ShiftResult(updatedShift, alert)

        eventPublisher.publishEvent(ShiftUpdated(result.shift, result.alert))

        return success(result)
    }

    fun findShiftsByCabinet(cid: Int): Either<ShiftError, List<Shift>> {
        val cabinet = cabinetRepo.findByIdOrNull(cid) ?: return failure(ShiftError.InvalidCabinetId)
        return success(shiftRepo.findByCabinet(cabinet))
    }

    fun findShiftsByUser(uid: Int): Either<ShiftError, List<Shift>> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ShiftError.InvalidUserId)
        return success(shiftRepo.findByUser(user))
    }

    fun hasActiveShift(cid: Int): Boolean {
        val cabinet = cabinetRepo.findByIdOrNull(cid) ?: return false
        return shiftRepo.findByCabinet(cabinet).any { it.status == ShiftStatus.ACTIVE }
    }
}
