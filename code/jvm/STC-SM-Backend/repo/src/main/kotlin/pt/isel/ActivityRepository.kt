package pt.isel

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.activity.Activity
import pt.isel.activity.ActivityType

@Repository
interface ActivityRepository : JpaRepository<Activity, Int> {
    // The DTO mapper reads user, cabinet and tool, so fetch them eagerly to avoid N+1.
    @EntityGraph(attributePaths = ["user", "cabinet", "tool"])
    fun findByUserId(userId: Int, pageable: Pageable): Page<Activity>

    @EntityGraph(attributePaths = ["user", "cabinet", "tool"])
    fun findByToolId(toolId: Int, pageable: Pageable): Page<Activity>

    @EntityGraph(attributePaths = ["user", "cabinet", "tool"])
    fun findByCabinetId(cabinetId: Int, pageable: Pageable): Page<Activity>

    @EntityGraph(attributePaths = ["user", "cabinet", "tool"])
    fun findByType(type: ActivityType, pageable: Pageable): Page<Activity>

    @EntityGraph(attributePaths = ["user", "cabinet", "tool"])
    fun findByTypeAndCabinetId(type: ActivityType, cabinetId: Int, pageable: Pageable): Page<Activity>
}
