package pt.isel

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.cabinet.Cabinet
import pt.isel.shift.Shift
import pt.isel.user.User

@Repository
interface ShiftRepository : JpaRepository<Shift, Int> {
    // Fetch the user and cabinet in the same query: the DTO mapper reads both, so this avoids N+1.
    @EntityGraph(attributePaths = ["user", "cabinet"])
    override fun findAll(): List<Shift>

    @EntityGraph(attributePaths = ["user", "cabinet"])
    fun findByCabinet(cabinet: Cabinet): List<Shift>

    @EntityGraph(attributePaths = ["user", "cabinet"])
    fun findByUser(user: User): List<Shift>
}
