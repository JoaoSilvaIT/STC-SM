import errors.ActivityError
import org.springframework.stereotype.Component
import activity.Activity
import utils.Either

@Component
class ActivityService {

    fun getActivity(id: Int): Either<ActivityError, Activity> {
        TODO("Implement activity fetching logic")
    }
}
