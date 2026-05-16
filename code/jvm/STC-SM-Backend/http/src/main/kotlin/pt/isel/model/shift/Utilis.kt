package pt.isel.model.shift

import org.springframework.http.ResponseEntity
import pt.isel.errors.ShiftError

fun ShiftError.toProblemResponse(): ResponseEntity<Any> =
    when(this) {
        ShiftError.ShiftNotFound -> TODO()
        ShiftError.InvalidUserId -> TODO()
        ShiftError.InvalidCabinetId -> TODO()
        ShiftError.InvalidTimeFormat -> TODO()
    }