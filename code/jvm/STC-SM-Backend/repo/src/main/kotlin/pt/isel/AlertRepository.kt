package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.alert.Alert
import pt.isel.alert.AlertType

@Repository
interface AlertRepository : JpaRepository<Alert, Int> {
    fun findByType(type: AlertType): List<Alert>
}