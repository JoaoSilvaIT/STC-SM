package user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component
import shift.Shift

@Component
interface ShiftRepository: JpaRepository<Shift, Int> {
}