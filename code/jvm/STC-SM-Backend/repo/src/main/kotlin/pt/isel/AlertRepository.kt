package pt.isel

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.alert.Alert
import pt.isel.alert.AlertStatus
import pt.isel.alert.AlertType

@Repository
interface AlertRepository : JpaRepository<Alert, Int> {
    fun findByType(type: AlertType): List<Alert>

    // The DTO mapper reads user, cabinet and tool, so fetch them eagerly to avoid N+1.
    @EntityGraph(attributePaths = ["user", "cabinet", "tool"])
    fun findByStatus(status: AlertStatus): List<Alert>
}
