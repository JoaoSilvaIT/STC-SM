package pt.isel.model.user

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import pt.isel.Problem
import pt.isel.errors.UserError

fun UserError.toProblemResponse(): ResponseEntity<Any> =
    when (this) {
        UserError.UserNotFoundOrInvalidCredentials -> Problem.UserNotFoundOrInvalidCredentials.response(HttpStatus.UNAUTHORIZED)
        UserError.UserNotFound -> Problem.UserNotFoundOrInvalidCredentials.response(HttpStatus.NOT_FOUND)
        UserError.BlankEmail -> Problem.BlankEmail.response(HttpStatus.BAD_REQUEST)
        UserError.BlankName -> Problem.BlankName.response(HttpStatus.BAD_REQUEST)
        UserError.BlankPassword -> Problem.BlankPassword.response(HttpStatus.BAD_REQUEST)
        UserError.EmailAlreadyInUse -> Problem.EmailAlreadyInUse.response(HttpStatus.CONFLICT)
        UserError.InvalidProfileId -> Problem.InvalidProfileId.response(HttpStatus.BAD_REQUEST)
        UserError.NotAuthorized -> Problem.NotAuthorized.response(HttpStatus.UNAUTHORIZED)
        UserError.BlankState -> Problem.BlankState.response(HttpStatus.BAD_REQUEST)
        UserError.InvalidState -> Problem.InvalidState.response(HttpStatus.BAD_REQUEST)
    }
