package user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import tools.Tool

@Repository
interface ToolRepository : JpaRepository<Tool, Int>