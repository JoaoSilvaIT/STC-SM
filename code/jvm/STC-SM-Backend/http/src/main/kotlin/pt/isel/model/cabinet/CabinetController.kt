package pt.isel.model.cabinet

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import pt.isel.CabinetService
import pt.isel.user.User
import pt.isel.utils.Either

@RestController
class CabinetController(
    private val cabinetService: CabinetService
) {
    @GetMapping("/api/cabinets/{id}")
    fun getCabinet(
        @PathVariable id: Int,
        user: User
    ): ResponseEntity<*> {
        return when(val result = cabinetService.getCabinet(id)){
            is Either.Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(CabinetOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @PutMapping("/api/cabinets/{id}")
    fun updateCabinet(
        @PathVariable id: Int,
        @RequestBody input: UpdateCabinetInputModel,
        user: User
    ): ResponseEntity<*> {
        return when(val result = cabinetService.updateCabinet(input.status, id)){
            is Either.Success ->
                ResponseEntity
                .status(HttpStatus.OK)
                .body(CabinetOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @PostMapping("/api/cabinets")
    fun createCabinet(
        @RequestBody input: CreateCabinetInputModel,
        user: User
    ): ResponseEntity<*> {
        return when(val result = cabinetService.createCabinet(input.description, input.status, input.location)){
            is Either.Success -> ResponseEntity
                .status(HttpStatus.CREATED)
                .header("Location", "/api/cabinets/${result.value.id}")
                .body(CabinetOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }
}