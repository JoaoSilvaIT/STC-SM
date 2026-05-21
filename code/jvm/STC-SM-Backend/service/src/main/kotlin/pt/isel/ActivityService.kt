package pt.isel

import pt.isel.errors.ActivityError
import org.springframework.stereotype.Service
import org.springframework.data.repository.findByIdOrNull
import org.springframework.transaction.annotation.Transactional
import pt.isel.activity.Activity
import pt.isel.activity.ActivityType
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
) {
    fun getAllActivities(): List<Activity> = activityRepo.findAll()

    fun getActivity(id: Int): Either<ActivityError, Activity> {
        val activity = activityRepo.findByIdOrNull(id) ?: return failure(ActivityError.ActivityNotFound)
        return success(activity)
    }

    fun getActivityByTool(tid: Int): Either<ActivityError, List<Activity>> {
        val activities = activityRepo.findByToolId(tid)
        return success(activities)
    }

    fun getActivityByUser(uid: Int): Either<ActivityError, List<Activity>> {
        val activities = activityRepo.findByUserId(uid)
        return success(activities)
    }

    fun getActivityByCabinet(cid: Int): Either<ActivityError, List<Activity>> {
        val activities = activityRepo.findByCabinetId(cid)
        return success(activities)
    }

    @Transactional
    fun createActivity(uid: Int, tid: Int?, cid: Int?, sid: Int?, type: ActivityType, date: Instant): Either<ActivityError, Activity> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ActivityError.InvalidUserId)

        val tool = if (tid != null) {
            toolRepo.findByIdOrNull(tid) ?: return failure(ActivityError.InvalidToolId)
        } else null

        val shift = if (sid != null) {
            shiftRepo.findByIdOrNull(sid) ?: return failure(ActivityError.InvalidToolId)
        } else null

        val cabinet = if (cid != null) {
            cabinetRepo.findByIdOrNull(cid) ?: return failure(ActivityError.InvalidCabinetId)
        } else null

        val activity = Activity(
            user = user,
            type = type,
            date = date,
            tool = tool,
            shift = shift,
            cabinet = cabinet
        )

        return success(activityRepo.save(activity))
    }
}
