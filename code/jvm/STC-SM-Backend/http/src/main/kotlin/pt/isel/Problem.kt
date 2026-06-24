package pt.isel

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.net.URI

private const val MEDIA_TYPE = "application/problem+json"
private const val PROBLEM_URI_PATH = "https://stc-sm.isel.pt/problems"

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

    data object BlankName : Problem(URI("$PROBLEM_URI_PATH/blank-name"))

    data object BlankPassword : Problem(URI("$PROBLEM_URI_PATH/blank-password"))

    data object UserNotFoundOrInvalidCredentials : Problem(URI("$PROBLEM_URI_PATH/user-not-found-or-invalid-credentials"))

    data object InvalidProfileId : Problem(URI("$PROBLEM_URI_PATH/invalid-profile-id"))

    data object EmailAlreadyInUse : Problem(URI("$PROBLEM_URI_PATH/email-already-in-use"))

    data object InsecurePassword : Problem(URI("$PROBLEM_URI_PATH/insecure-password"))

    data object ToolNotFound : Problem(URI("$PROBLEM_URI_PATH/tool-not-found"))

    data object CabinetNotFound : Problem(URI("$PROBLEM_URI_PATH/cabinet-not-found"))

    data object InvalidCabinetStatus : Problem(URI("$PROBLEM_URI_PATH/invalid-cabinet-status"))

    data object ShiftNotFound : Problem(URI("$PROBLEM_URI_PATH/shift-not-found"))

    data object CabinetAlreadyHasActiveShift : Problem(URI("$PROBLEM_URI_PATH/cabinet-already-has-active-shift"))

    data object UserAlreadyHasActiveShift : Problem(URI("$PROBLEM_URI_PATH/user-already-has-active-shift"))

    data object ShiftAlreadyEnded : Problem(URI("$PROBLEM_URI_PATH/shift-already-ended"))

    data object ActivityNotFound : Problem(URI("$PROBLEM_URI_PATH/activity-not-found"))

    data object InvalidTimeFormat : Problem(URI("$PROBLEM_URI_PATH/invalid-time-format"))

    data object InvalidTimeRange : Problem(URI("$PROBLEM_URI_PATH/invalid-time-range"))

    data object ProfileNotFound : Problem(URI("$PROBLEM_URI_PATH/profile-not-found"))

    data object NoActiveShiftOnCabinet : Problem(URI("$PROBLEM_URI_PATH/no-active-shift-on-cabinet"))

    data object InvalidLocationForCabinet : Problem(URI("$PROBLEM_URI_PATH/invalid-location-for-cabinet"))

    data object InvalidDescriptionForCabinet : Problem(URI("$PROBLEM_URI_PATH/invalid-description-for-cabinet"))

    data object NotAuthorized : Problem(URI("$PROBLEM_URI_PATH/not-authorized"))

    data object BlankState : Problem(URI("$PROBLEM_URI_PATH/blank-state"))

    data object InvalidState : Problem(URI("$PROBLEM_URI_PATH/invalid-state"))

    data object ShiftAlreadyStarted : Problem(URI("$PROBLEM_URI_PATH/shift-already-started"))

    data object AlertNotFound : Problem(URI("$PROBLEM_URI_PATH/alert-not-found"))

    data object ShiftOutOfTime : Problem(URI("$PROBLEM_URI_PATH/shift-out-of-time"))

    data object ShiftAlreadyHappening : Problem(URI("$PROBLEM_URI_PATH/shift-already-happening"))
}
