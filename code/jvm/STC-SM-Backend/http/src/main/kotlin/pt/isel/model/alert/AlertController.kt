package pt.isel.model.alert

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RestController
import pt.isel.AlertService
import pt.isel.user.User
import pt.isel.utils.Either

@RestController
class AlertController(private val alertService: AlertService) {
    @GetMapping("/api/alerts/unread")
    fun getUnreadAlerts(@Suppress("UNUSED_PARAMETER") user: User
    ): ResponseEntity<*> =
        when (val result = alertService.getUnreadAlerts()) {
            is Either.Success -> ResponseEntity.ok(result.value.map(AlertOutputModel.Companion::fromDomain))
            is Either.Failure -> result.value.toProblemResponse()
        }

    @PutMapping("/api/alerts/{id}")
    fun updateAlert(
        @PathVariable id: Int,
        @Suppress("UNUSED_PARAMETER") user: User
    ): ResponseEntity<*> {
        return when (val result = alertService.markAsReadAlert(id)){
            is Either.Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(AlertOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

}