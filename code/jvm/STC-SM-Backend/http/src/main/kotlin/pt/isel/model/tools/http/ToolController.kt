package pt.isel.model.tools.http

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import pt.isel.ToolService
import pt.isel.model.tools.CreateToolInput
import pt.isel.model.tools.ToolOutputModel
import pt.isel.model.tools.UpdateToolInput
import pt.isel.model.tools.toProblemResponse
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

    @PostMapping("/api/tools")
    fun create(
        @RequestBody input: CreateToolInput,
        user: User
    ): ResponseEntity<*> =
        when (val result = toolService.createTool(input.name, input.cabinetId, input.status, input.location, user)) {
            is Either.Success -> ResponseEntity
                .status(HttpStatus.CREATED)
                .header("Location", "/api/tools/${result.value.id}")
                .body(ToolOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }

    @PutMapping("/api/tools/{id}")
    fun update(
        @PathVariable id: Int,
        @RequestBody input: UpdateToolInput,
        user: User
    ): ResponseEntity<*> =
        when (val result = toolService.updateTool(id, input.status, user.id)) {
            is Either.Success -> ResponseEntity.ok(ToolOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
}