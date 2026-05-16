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

    data object BlankEmail : Problem(URI("$PROBLEM_URI_PATH/blank-email"))

    data object BlankName : Problem(URI("$PROBLEM_URI_PATH/blank-name"))

    data object BlankPassword : Problem(URI("$PROBLEM_URI_PATH/blank-password"))

    data object UserNotFoundOrInvalidCredentials : Problem(URI("$PROBLEM_URI_PATH/user-not-found-or-invalid-credentials"))

    data object UserNotFound : Problem(URI("$PROBLEM_URI_PATH/user-not-found"))

    data object EmailAlreadyInUse : Problem(URI("$PROBLEM_URI_PATH/email-already-in-use"))

    data object InvalidProfileId : Problem(URI("$PROBLEM_URI_PATH/invalid-profile-id"))

    data object InsecurePassword : Problem(URI("$PROBLEM_URI_PATH/insecure-password"))

    data object ToolNotFound : Problem(URI("$PROBLEM_URI_PATH/tool-not-found"))

    data object CabinetNotFound : Problem(URI("$PROBLEM_URI_PATH/cabinet-not-found"))

    data object ShiftNotFound : Problem(URI("$PROBLEM_URI_PATH/shift-not-found"))

    data object CabinetAlreadyHasActiveShift : Problem(URI("$PROBLEM_URI_PATH/cabinet-already-has-active-shift"))

    data object UserAlreadyHasActiveShift : Problem(URI("$PROBLEM_URI_PATH/user-already-has-active-shift"))

    data object ShiftAlreadyEnded : Problem(URI("$PROBLEM_URI_PATH/shift-already-ended"))

    data object ActivityNotFound : Problem(URI("$PROBLEM_URI_PATH/activity-not-found"))

    data object NoActiveShiftOnCabinet : Problem(URI("$PROBLEM_URI_PATH/no-active-shift-on-cabinet"))
}
