package pt.isel

import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import pt.isel.activity.Activity
import pt.isel.activity.ActivityType
import pt.isel.errors.ActivityError
import pt.isel.events.ActivityNotification
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Instant

@Service
class ActivityService(
    private val activityRepo: ActivityRepository,
    private val userRepo: UserRepository,
    private val cabinetRepo: CabinetRepository,
    private val toolRepo: ToolRepository,
    private val shiftRepo: ShiftRepository,
    private val eventPublisher: ApplicationEventPublisher,
) {
    fun getAllActivities(pageable: Pageable): Page<Activity> = activityRepo.findAll(pageable)

    /** Paginated activities, optionally narrowed by type and/or cabinet. */
    fun getActivities(type: ActivityType?, cabinetId: Int?, pageable: Pageable): Page<Activity> =
        when {
            type != null && cabinetId != null -> activityRepo.findByTypeAndCabinetId(type, cabinetId, pageable)
            type != null -> activityRepo.findByType(type, pageable)
            cabinetId != null -> activityRepo.findByCabinetId(cabinetId, pageable)
            else -> activityRepo.findAll(pageable)
        }

    fun getActivity(id: Int): Either<ActivityError, Activity> {
        val activity = activityRepo.findByIdOrNull(id) ?: return failure(ActivityError.ActivityNotFound)
        return success(activity)
    }

    fun getActivitiesByTool(tid: Int, pageable: Pageable): Either<ActivityError, Page<Activity>> {
        val activities = activityRepo.findByToolId(tid, pageable)
        return success(activities)
    }

    fun getActivitiesByUser(uid: Int, pageable: Pageable): Either<ActivityError, Page<Activity>> {
        val activities = activityRepo.findByUserId(uid, pageable)
        return success(activities)
    }

    fun getActivitiesByCabinet(cid: Int, pageable: Pageable): Either<ActivityError, Page<Activity>> {
        val activities = activityRepo.findByCabinetId(cid, pageable)
        return success(activities)
    }

    @Transactional
    fun createActivity(
        uid: Int,
        tid: Int?,
        cid: Int?,
        sid: Int?,
        type: ActivityType,
        date: Instant,
    ): Either<ActivityError, Activity> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ActivityError.InvalidUserId)

        val tool =
            if (tid != null) {
                toolRepo.findByIdOrNull(tid) ?: return failure(ActivityError.InvalidToolId)
            } else {
                null
            }

        val shift =
            if (sid != null) {
                shiftRepo.findByIdOrNull(sid) ?: return failure(ActivityError.InvalidShiftId)
            } else {
                null
            }

        val cabinet =
            if (cid != null) {
                cabinetRepo.findByIdOrNull(cid) ?: return failure(ActivityError.InvalidCabinetId)
            } else {
                null
            }

        val activity =
            Activity(
                user = user,
                type = type,
                date = date,
                tool = tool,
                shift = shift,
                cabinet = cabinet,
            )

        val saved = activityRepo.save(activity)

        eventPublisher.publishEvent(ActivityNotification(saved))

        return success(saved)
    }
}
