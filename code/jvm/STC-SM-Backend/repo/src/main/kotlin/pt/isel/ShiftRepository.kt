package pt.isel

import ch.qos.logback.core.util.DirectJson
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.cabinet.Cabinet
import pt.isel.shift.Shift
import pt.isel.user.User

@Repository
interface ShiftRepository : JpaRepository<Shift, Int> {
    fun findByCabinet(cabinet: Cabinet) : List<Shift>
    fun findByUser(user: User) : List<Shift>
}