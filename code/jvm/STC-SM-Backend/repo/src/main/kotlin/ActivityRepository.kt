import activity.Activity
import org.springframework.stereotype.Component

@Component
interface ActivityRepository : Repository<Activity> {
    // Add specific queries for Activity if needed later
}
