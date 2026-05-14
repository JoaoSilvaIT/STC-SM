package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.tools.Tool

@Repository
interface ToolRepository : JpaRepository<Tool, Int>