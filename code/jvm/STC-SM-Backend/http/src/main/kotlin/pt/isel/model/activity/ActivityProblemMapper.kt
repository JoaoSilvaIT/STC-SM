package pt.isel.model.activity

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import pt.isel.Problem
import pt.isel.errors.ActivityError

fun ActivityError.toProblemResponse(): ResponseEntity<Any> =
    when (this) {
        ActivityError.ActivityNotFound -> Problem.ActivityNotFound.response(HttpStatus.NOT_FOUND)
        ActivityError.InvalidUserId -> Problem.UserNotFoundOrInvalidCredentials.response(HttpStatus.BAD_REQUEST)
        ActivityError.InvalidCabinetId -> Problem.CabinetNotFound.response(HttpStatus.BAD_REQUEST)
        ActivityError.InvalidToolId -> Problem.ToolNotFound.response(HttpStatus.BAD_REQUEST)
        ActivityError.InvalidShiftId -> Problem.ShiftNotFound.response(HttpStatus.BAD_REQUEST)
    }
