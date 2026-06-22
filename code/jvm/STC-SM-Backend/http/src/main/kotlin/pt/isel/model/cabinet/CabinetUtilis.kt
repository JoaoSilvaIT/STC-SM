package pt.isel.model.cabinet

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import pt.isel.errors.CabinetError
import pt.isel.Problem

fun CabinetError.toProblemResponse(): ResponseEntity<Any> =
    when (this) {
        CabinetError.CabinetNotFound -> Problem.CabinetNotFound.response(HttpStatus.NOT_FOUND)
        CabinetError.InvalidCabinetStatus -> Problem.CabinetNotFound.response(HttpStatus.BAD_REQUEST)
        CabinetError.InvalidLocation -> Problem.InvalidLocationForCabinet.response(HttpStatus.BAD_REQUEST)
        CabinetError.InvalidDescription -> Problem.InvalidDescriptionForCabinet.response(HttpStatus.BAD_REQUEST)
        CabinetError.UserNotFound -> Problem.UserNotFoundOrInvalidCredentials.response(HttpStatus.BAD_REQUEST)
    }