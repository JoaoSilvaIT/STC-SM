package pt.isel.model.cabinet

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import pt.isel.Problem
import pt.isel.errors.CabinetError

fun CabinetError.toProblemResponse(): ResponseEntity<Any> =
    when (this) {
        CabinetError.CabinetNotFound -> Problem.CabinetNotFound.response(HttpStatus.NOT_FOUND)
        CabinetError.InvalidCabinetStatus -> Problem.InvalidCabinetStatus.response(HttpStatus.BAD_REQUEST)
        CabinetError.InvalidLocation -> Problem.InvalidLocationForCabinet.response(HttpStatus.BAD_REQUEST)
        CabinetError.InvalidDescription -> Problem.InvalidDescriptionForCabinet.response(HttpStatus.BAD_REQUEST)
        CabinetError.UserNotFound -> Problem.UserNotFoundOrInvalidCredentials.response(HttpStatus.BAD_REQUEST)
        CabinetError.InvalidRole -> Problem.InvalidRole.response(HttpStatus.FORBIDDEN)
    }
