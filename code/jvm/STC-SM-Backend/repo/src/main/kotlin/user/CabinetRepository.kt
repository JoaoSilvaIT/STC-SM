package user

import cabinet.Cabinet
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CabinetRepository : JpaRepository<Cabinet, Int>
