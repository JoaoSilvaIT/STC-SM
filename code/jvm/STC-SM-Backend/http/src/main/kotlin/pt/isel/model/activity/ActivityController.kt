package pt.isel.model.activity

import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import pt.isel.ActivityService
import pt.isel.model.PageOutputModel
import pt.isel.user.User
import pt.isel.utils.Either
import java.time.Instant

@RestController
class ActivityController(
    private val activityService: ActivityService,
) {
    @GetMapping("/api/activities")
    fun getAllActivities(
        @Suppress("UNUSED_PARAMETER") user: User,
        pageable: Pageable,
    ): ResponseEntity<PageOutputModel<ActivityOutputModel>> {
        val result = activityService.getAllActivities(pageable).map { ActivityOutputModel.fromDomain(it) }
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(PageOutputModel.fromDomain(result))
    }

    @GetMapping("/api/activities/{id}")
    fun getActivityById(@PathVariable id: Int, @Suppress("UNUSED_PARAMETER") user: User): ResponseEntity<*> =
        when (val result = activityService.getActivity(id)) {
            is Either.Success -> ResponseEntity.ok(ActivityOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }

    @GetMapping("/api/activities/cabinets/{id}")
    fun getActivitiesByCabinet(@PathVariable id: Int, @Suppress("UNUSED_PARAMETER") user: User, pageable: Pageable): ResponseEntity<*> {
        return when (val result = activityService.getActivitiesByCabinet(id, pageable)) {
            is Either.Success -> ResponseEntity.ok(PageOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @GetMapping("/api/activities/tools/{id}")
    fun getActivitiesByTool(@PathVariable id: Int, @Suppress("UNUSED_PARAMETER") user: User, pageable: Pageable): ResponseEntity<*> {
        return when (val result = activityService.getActivitiesByTool(id, pageable)) {
            is Either.Success -> ResponseEntity.ok(PageOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @GetMapping("/api/activities/users/{id}")
    fun getActivitiesByUser(@PathVariable id: Int, @Suppress("UNUSED_PARAMETER") user: User, pageable: Pageable): ResponseEntity<*> {
        return when (val result = activityService.getActivitiesByUser(id, pageable)) {
            is Either.Success -> ResponseEntity.ok(PageOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
    }

    @PostMapping("/api/activities")
    fun create(
        @Suppress("UNUSED_PARAMETER") user: User,
        @RequestBody input: ActivityInputModel,
    ): ResponseEntity<*> =
        when (
            val result =
                activityService.createActivity(
                    uid = input.uid,
                    tid = input.tid,
                    cid = input.cid,
                    sid = input.sid,
                    type = input.type,
                    date = Instant.now(),
                )
        ) {
            is Either.Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Location", "/api/activities/${result.value.id}")
                    .body(ActivityOutputModel.fromDomain(result.value))
            is Either.Failure -> result.value.toProblemResponse()
        }
}
