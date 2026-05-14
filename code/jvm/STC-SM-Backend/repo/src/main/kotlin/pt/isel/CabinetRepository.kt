package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.cabinet.Cabinet

@Repository
interface CabinetRepository : JpaRepository<Cabinet, Int>
