import org.springframework.stereotype.Component
import tools.Tool

@Component
interface ToolRepository : Repository<Tool> {
    // Add specific queries for Tool if needed later
}
