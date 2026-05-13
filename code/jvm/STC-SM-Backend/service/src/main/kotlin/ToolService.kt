import errors.ToolError
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.springframework.stereotype.Component
import tools.Tool
import tools.ToolStatus
import user.ToolRepository
import utils.Either
import utils.failure
import utils.success

@Component
class ToolService(private val toolRepo: ToolRepository) {

    fun getTool(tid: Int): Either<ToolError, Tool> {
        return try{
            success(toolRepo.getReferenceById(tid))
        }catch(e: Exception){
            failure(ToolError.ToolNotFound)
        }
    }

    @Transactional
    fun updateTool(id: Int, status : ToolStatus): Either<ToolError, Tool> {
        return try {
            val tool = toolRepo.getReferenceById(id)
            success(toolRepo.saveAndFlush(tool.copy(status = status)))
        }catch(e: Exception){
            failure(ToolError.ToolNotFound)
        }

    }
}
