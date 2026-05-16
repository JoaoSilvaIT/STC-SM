package pt.isel.model.user

import org.springframework.http.HttpStatus
import pt.isel.errors.UserError
import org.springframework.http.ResponseEntity
import pt.isel.model.Problem

fun UserError.toProblemResponse(): ResponseEntity<Any> =
    when (this) {
        UserError.UserNotFoundOrInvalidCredentials -> Problem.UserNotFoundOrInvalidCredentials.response(HttpStatus.UNAUTHORIZED)
        UserError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
        UserError.BlankEmail -> Problem.BlankEmail.response(HttpStatus.BAD_REQUEST)
        UserError.BlankName -> Problem.BlankName.response(HttpStatus.BAD_REQUEST)
        UserError.BlankPassword -> Problem.BlankPassword.response(HttpStatus.BAD_REQUEST)
        UserError.EmailAlreadyInUse -> Problem.EmailAlreadyInUse.response(HttpStatus.CONFLICT)
        UserError.InvalidProfileId -> Problem.InvalidProfileId.response(HttpStatus.BAD_REQUEST)
    }