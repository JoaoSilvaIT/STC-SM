import errors.ToolError
import org.springframework.stereotype.Component
import tools.Tool
import utils.Either

@Component
class ToolService {

    fun getTool(id: Int): Either<ToolError, Tool> {
        TODO("Implement tool fetching logic")
    }
}
