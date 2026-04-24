import shift.Shift
import org.springframework.stereotype.Component

@Component
interface ShiftRepository : Repository<Shift> {
    // Add specific queries for Shift if needed later
}
