package pt.isel.model.shift

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import pt.isel.ShiftService
import pt.isel.shift.Shift
import pt.isel.user.User
import pt.isel.utils.Either

@RestController
class ShiftController(
    private val shiftService: ShiftService
) {
    @PostMapping("api/shifts")
    fun createShift(
        @RequestBody shiftInput: ShiftInput,
        user: User  // The user needs to be authenticated to use this kind of resource
    ) : ResponseEntity<*> {
        return when(val result = shiftService.createShift(
            shiftInput.uid,
            shiftInput.cid,
            shiftInput.startTime,
            shiftInput.endTime,
        )) {
            is Either.Success -> ResponseEntity
                .status(HttpStatus.CREATED)
                .header(
                    "Location",
                    "/api/shifts/${result.value.id}"
                ).body(ShiftOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }
}