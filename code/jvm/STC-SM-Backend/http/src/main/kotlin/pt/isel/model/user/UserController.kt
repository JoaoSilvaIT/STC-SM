package pt.isel.model.user

import pt.isel.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
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

    @PutMapping("/api/users/{id}")
    fun updateUser(
        @PathVariable id: Int,
        @RequestBody updateUserInput: UpdateUserInput,
        user: User
    ): ResponseEntity<*> {
        return when(val result = userService.updateUser(
            updateUserInput.state,
            id
        )) {
            is Either.Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                .header(
                    "Location",
                    "/api/users/${result.value.id}",
                ).body(UserOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }
}