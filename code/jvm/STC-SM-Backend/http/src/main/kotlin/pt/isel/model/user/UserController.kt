package pt.isel.model.user

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import pt.isel.UserService
import pt.isel.user.User
import pt.isel.utils.Either

@RestController
class UserController(
    private val userService: UserService,
) {
    @PostMapping("/api/users")
    fun createUser(
        @RequestBody userInput: UserInput,
        user: User,
    ): ResponseEntity<*> =
        when (
            val result =
                userService.createUser(
                    userInput.name,
                    userInput.email,
                    userInput.password,
                    userInput.profile,
                    user,
                )
        ) {
            is Either.Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/users/${result.value.id}",
                    ).body(UserOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }

    @PutMapping("/api/users/{id}")
    fun updateUser(
        @PathVariable id: Int,
        @RequestBody updateUserInput: UpdateUserInput,
        @Suppress("UNUSED_PARAMETER") user: User,
    ): ResponseEntity<*> =
        when (
            val result =
                userService.updateUser(
                    updateUserInput.state,
                    id,
                )
        ) {
            is Either.Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .header(
                        "Location",
                        "/api/users/${result.value.id}",
                    ).body(UserOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }

    @GetMapping("/api/users")
    fun listUsers(user: User): ResponseEntity<*> =
        when (val result = userService.getAllUsers(user)) {
            is Either.Success -> ResponseEntity.ok(result.value.map(UserOutputModel.Companion::fromDomain))
            is Either.Failure -> result.value.toProblemResponse()
        }

    @GetMapping("/api/users/me")
    fun me(user: User): ResponseEntity<UserOutputModel> = ResponseEntity.ok(UserOutputModel.fromDomain(user))
}
