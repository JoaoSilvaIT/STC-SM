package pt.isel

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
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
) {
    fun getAllActivities(pageable: Pageable): Page<Activity> = activityRepo.findAll(pageable)

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
    fun createActivity(uid: Int, tid: Int?, cid: Int?, type: ActivityType): Either<ActivityError, Activity> {
        val user = userRepo.findByIdOrNull(uid) ?: return failure(ActivityError.InvalidUserId)

        val tool = if (tid != null) {
            toolRepo.findByIdOrNull(tid) ?: return failure(ActivityError.InvalidToolId)
        } else null

        val cabinet = if (cid != null) {
            cabinetRepo.findByIdOrNull(cid) ?: return failure(ActivityError.InvalidCabinetId)
        } else null

        val activity = Activity(
            user = user,
            type = type,
            date = Instant.now(),
            tool = tool,
            cabinet = cabinet
        )

        return success(activityRepo.save(activity))
    }
}
