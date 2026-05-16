package pt.isel.model.shift

import org.springframework.core.io.ResourceLoader
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import pt.isel.ShiftService
import pt.isel.shift.Shift
import pt.isel.user.User
import pt.isel.utils.Either

@RestController
class ShiftController(
    private val shiftService: ShiftService,
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

    @GetMapping("api/shifts/{id}")
    fun getShiftById(
        @PathVariable id: Int
    ): ResponseEntity<*> {
        return when(val result = shiftService.getShift(id)) {
            is Either.Success -> ResponseEntity
                .status(HttpStatus.OK)
                .body(ShiftOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @GetMapping("api/shifts/user/{id}")
    fun getShiftByUserId(
        @PathVariable id: Int
    ): ResponseEntity<*> {
        return when(val result = shiftService.findShiftsByUser(id)) {
            is Either.Success -> {
                val responseBody = result.value.map {
                    ShiftOutputModel.fromDomain(it)
                }
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(responseBody)
            }
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @GetMapping("api/shifts/cabinet/{id}")
    fun getShiftByCabinetId(
        @PathVariable id: Int
    ): ResponseEntity<*> {
        return when(val result = shiftService.findShiftsByCabinet(id)) {
            is Either.Success -> {
                val responseBody = result.value.map { shift ->
                    ShiftOutputModel.fromDomain(shift)
                }
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(responseBody)
            }
            is Either.Failure -> result.value.toProblemResponse()
        }
    }
}