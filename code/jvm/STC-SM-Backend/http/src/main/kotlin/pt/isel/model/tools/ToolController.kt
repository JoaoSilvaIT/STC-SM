package pt.isel.model.tools

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import pt.isel.ToolService
import pt.isel.user.User
import pt.isel.utils.Either

@RestController
class ToolController(private val toolService: ToolService) {

    @GetMapping("/api/tools")
    fun list(@Suppress("UNUSED_PARAMETER") user: User): ResponseEntity<List<ToolOutputModel>> =
        ResponseEntity.ok(toolService.getAllTools().map(ToolOutputModel.Companion::fromDomain))

    @GetMapping("/api/tools/{id}")
    fun get(@PathVariable id: Int, @Suppress("UNUSED_PARAMETER") user: User): ResponseEntity<*> =
        when (val result = toolService.getTool(id)) {
            is Either.Success -> ResponseEntity.ok(ToolOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
}
