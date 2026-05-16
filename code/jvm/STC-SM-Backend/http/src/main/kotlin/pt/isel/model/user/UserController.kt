package pt.isel.model.user

import pt.isel.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import pt.isel.user.User
import pt.isel.utils.Either

@RestController
class UserController(
    private val userService: UserService
) {
    @PostMapping("/api/users")
    fun createUser(
        @RequestBody userInput: UserInput,
        user: User
    ): ResponseEntity<*> {
        return when(val result = userService.createUser(
            userInput.name,
            userInput.email,
            userInput.password,
            userInput.profile,
            user
        )) {
            is Either.Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/users/${result.value.id}",
                    ).body(UserOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @DeleteMapping("/api/users/{id}")
    fun deleteUser(
        @PathVariable id: Int,
        user: User,
    ): ResponseEntity<*> {
        return when(val result = userService.deleteUser(id, user)) {
            is Either.Success ->
                ResponseEntity.noContent().build<Unit>()
            is Either.Failure -> result.value.toProblemResponse()
        }
    }
}