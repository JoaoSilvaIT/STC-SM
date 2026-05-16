package pt.isel.model.user

import pt.isel.errors.UserError
import org.springframework.http.ResponseEntity

fun UserError.toProblemResponse(): ResponseEntity<Any> =
    when(this) {
        UserError.UserNotFoundOrInvalidCredentials -> TODO()
        UserError.BlankEmail -> TODO()
        UserError.BlankName -> TODO()
        UserError.BlankPassword -> TODO()
        UserError.EmailAlreadyInUse -> TODO()
    }