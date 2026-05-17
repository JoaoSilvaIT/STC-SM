package pt.isel.model.tools

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import pt.isel.errors.ToolError
import pt.isel.Problem

fun ToolError.toProblemResponse(): ResponseEntity<Any> =
    when (this) {
        ToolError.ToolNotFound -> Problem.ToolNotFound.response(HttpStatus.NOT_FOUND)
        ToolError.ToolNotActive -> Problem.ToolNotFound.response(HttpStatus.CONFLICT)
        ToolError.InvalidName -> Problem.BlankName.response(HttpStatus.BAD_REQUEST)
        ToolError.InvalidLocation -> Problem.InvalidLocationForCabinet.response(HttpStatus.BAD_REQUEST)
        ToolError.InvalidCabinet -> Problem.CabinetNotFound.response(HttpStatus.BAD_REQUEST)
    }
