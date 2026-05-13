package user

import activity.Activity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component

@Component
interface ActivityRepository: JpaRepository<Activity, Int> {
}