package user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component
import tools.Tool

@Component
interface ToolRepository: JpaRepository<Tool, Int>