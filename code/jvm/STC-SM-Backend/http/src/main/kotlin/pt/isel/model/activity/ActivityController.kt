package pt.isel.model.activity

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import pt.isel.ActivityService
import pt.isel.user.User
import pt.isel.utils.Either

@RestController
class ActivityController(private val activityService: ActivityService) {

    @GetMapping("/api/activities")
    fun list(@Suppress("UNUSED_PARAMETER") user: User): ResponseEntity<List<ActivityOutputModel>> =
        ResponseEntity.ok(activityService.getAllActivities().map(ActivityOutputModel.Companion::fromDomain))

    @GetMapping("/api/activities/{id}")
    fun get(@PathVariable id: Int, @Suppress("UNUSED_PARAMETER") user: User): ResponseEntity<*> =
        when (val result = activityService.getActivity(id)) {
            is Either.Success -> ResponseEntity.ok(ActivityOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
}
