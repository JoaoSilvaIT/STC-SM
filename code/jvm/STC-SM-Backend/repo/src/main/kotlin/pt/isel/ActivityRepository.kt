package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.activity.Activity
import pt.isel.cabinet.Cabinet
import pt.isel.tools.Tool
import pt.isel.user.User


@Repository
interface ActivityRepository : JpaRepository<Activity, Int> {
    fun findByUser(user: User): List<Activity>
    fun findByTool(tool: Tool): List<Activity>
    fun findByCabinet(cabinet: Cabinet): List<Activity>

    fun findByUserId(userId: Int): List<Activity>
    fun findByToolId(toolId: Int): List<Activity>
    fun findByCabinetId(cabinetId: Int): List<Activity>
}