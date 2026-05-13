package model.user

import UserService
import utils.Either
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

@RestController
class UserController(
    private val userService: UserService
) {

    @GetMapping("api/users/{id}")
    fun getUser(@PathVariable id: Int): ResponseEntity<*> {
        return when (val result = userService.getUser(id)) {
            is Either.Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)
            is Either.Failure ->
                ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(result.value.toString())
        }
    }



}