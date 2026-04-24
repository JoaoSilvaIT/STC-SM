import cabinet.Cabinet
import org.springframework.stereotype.Component

@Component
interface CabinetRepository : Repository<Cabinet> {
    // Add specific queries for Cabinet if needed later
}
