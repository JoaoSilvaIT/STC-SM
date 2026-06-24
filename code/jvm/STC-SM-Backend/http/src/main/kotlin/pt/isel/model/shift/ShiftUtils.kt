package pt.isel.model.shift

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import pt.isel.Problem
import pt.isel.errors.ShiftError

fun ShiftError.toProblemResponse(): ResponseEntity<Any> =
    when (this) {
        ShiftError.ShiftNotFound -> Problem.ShiftNotFound.response(HttpStatus.NOT_FOUND)
        ShiftError.InvalidUserId -> Problem.UserNotFoundOrInvalidCredentials.response(HttpStatus.BAD_REQUEST)
        ShiftError.InvalidCabinetId -> Problem.CabinetNotFound.response(HttpStatus.BAD_REQUEST)
        ShiftError.InvalidTimeFormat -> Problem.InvalidTimeFormat.response(HttpStatus.BAD_REQUEST)
        ShiftError.InvalidTimeRange -> Problem.InvalidTimeRange.response(HttpStatus.BAD_REQUEST)
        ShiftError.NotAuthorized -> Problem.NotAuthorized.response(HttpStatus.UNAUTHORIZED)
        ShiftError.ShiftAlreadyStarted -> Problem.ShiftAlreadyStarted.response(HttpStatus.CONFLICT)
        ShiftError.ShiftAlreadyEnded -> Problem.ShiftAlreadyEnded.response(HttpStatus.CONFLICT)
        ShiftError.ShiftOutOfTime -> Problem.ShiftOutOfTime.response(HttpStatus.CONFLICT)
        ShiftError.ShiftAlreadyHappening -> Problem.ShiftAlreadyHappening.response(HttpStatus.CONFLICT)
    }
