import errors.ActivityError
import org.springframework.stereotype.Component
import activity.Activity
import activity.ActivityType
import utils.Either
import java.time.Instant

@Component
class ActivityService {
    fun getActivity(id: Int): Either<ActivityError, Activity> {
        TODO("Implement activity fetching logic")
    }

    fun getActivityByTool(tid: Int): Either<ActivityError, Activity> {
        TODO()
    }

    fun getActivityByUser(uid: Int): Either<ActivityError, Activity> {
        TODO()
    }

    fun getActivityByCabinet(cid: Int): Either<ActivityError, Activity> {
        TODO()
    }

    fun createActivity(uid: Int, type: ActivityType, date: Instant): Either<ActivityError, Activity> {
        TODO()
    }
}
