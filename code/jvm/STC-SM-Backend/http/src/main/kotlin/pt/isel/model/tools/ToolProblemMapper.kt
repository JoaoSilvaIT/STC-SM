package pt.isel.model.tools

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import pt.isel.Problem
import pt.isel.errors.ToolError
import pt.isel.tools.Tool

fun ToolError.toProblemResponse(): ResponseEntity<Any> =
    when (this) {
        ToolError.ToolNotFound -> Problem.ToolNotFound.response(HttpStatus.NOT_FOUND)
        ToolError.ToolNotActive -> Problem.ToolNotFound.response(HttpStatus.CONFLICT)
        ToolError.InvalidName -> Problem.BlankName.response(HttpStatus.BAD_REQUEST)
        ToolError.InvalidLocation -> Problem.InvalidLocationForCabinet.response(HttpStatus.BAD_REQUEST)
        ToolError.InvalidCabinet -> Problem.CabinetNotFound.response(HttpStatus.BAD_REQUEST)
        ToolError.UserNotFound -> Problem.UserNotFoundOrInvalidCredentials.response(HttpStatus.BAD_REQUEST)
        ToolError.NotAuthorized -> Problem.NotAuthorized.response(HttpStatus.FORBIDDEN)
    }
