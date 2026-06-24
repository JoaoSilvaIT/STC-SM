package pt.isel

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.tools.Tool

@Repository
interface ToolRepository : JpaRepository<Tool, Int> {
    // The DTO mapper reads the cabinet, so fetch it eagerly to avoid N+1.
    @EntityGraph(attributePaths = ["cabinet"])
    override fun findAll(): List<Tool>
}
