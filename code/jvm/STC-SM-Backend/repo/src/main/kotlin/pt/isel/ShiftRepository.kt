package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.shift.Shift

@Repository
interface ShiftRepository : JpaRepository<Shift, Int> {
}