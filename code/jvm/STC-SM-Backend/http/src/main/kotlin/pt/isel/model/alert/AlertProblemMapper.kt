package pt.isel.model.alert

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import pt.isel.Problem
import pt.isel.errors.AlertError

fun AlertError.toProblemResponse(): ResponseEntity<Any> =
    when(this) {
        AlertError.AlertsNotFound -> Problem.AlertNotFound.response(HttpStatus.NOT_FOUND)
    }