package pt.isel.model

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.net.URI

private const val MEDIA_TYPE = "application/problem+json"
private const val PROBLEM_URI_PATH = "placeholder"

sealed class Problem(
    typeUri: URI,
) {
    val type = typeUri.toString()
    val title = typeUri.toString().split("/").last()

    fun response(status: HttpStatus): ResponseEntity<Any> =
        ResponseEntity
            .status(status)
            .header("Content-Type", MEDIA_TYPE)
            .body(this)

    // Authentication errors
    data object BlankEmail : Problem(URI("$PROBLEM_URI_PATH/blank-email"))

    data object BlankPassword : Problem(URI("$PROBLEM_URI_PATH/blank-password"))

    data object UserNotFoundOrInvalidCredentials : Problem(URI("$PROBLEM_URI_PATH/user-not-found-or-invalid-credentials"))

    data object EmailAlreadyInUse : Problem(URI("$PROBLEM_URI_PATH/email-already-in-use"))

    data object InsecurePassword : Problem(URI("$PROBLEM_URI_PATH/insecure-password"))
}