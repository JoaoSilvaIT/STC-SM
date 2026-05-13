package user

import activity.Activity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import tools.Tool
import user.User
import cabinet.Cabinet

@Repository
interface ActivityRepository : JpaRepository<Activity, Int> {
    fun findByUser(user: User): List<Activity>
    fun findByTool(tool: Tool): List<Activity>
    fun findByCabinet(cabinet: Cabinet): List<Activity>
}