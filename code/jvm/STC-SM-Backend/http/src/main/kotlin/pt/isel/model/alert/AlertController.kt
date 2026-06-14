package pt.isel.model.alert

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import pt.isel.AlertService
import pt.isel.utils.Either

@RestController
class AlertController(private val alertService: AlertService) {
    @GetMapping("/api/alerts/unread")
    fun getUnreadAlerts(): ResponseEntity<*> =
        when (val result = alertService.getUnreadAlerts()) {
            is Either.Success -> ResponseEntity.ok(result.value.map(AlertOutputModel.Companion::fromDomain))
            is Either.Failure -> result.value.toProblemResponse()
        }
}