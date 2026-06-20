package pt.isel

import pt.isel.errors.CabinetError
import org.springframework.stereotype.Service
import org.springframework.data.repository.findByIdOrNull
import org.springframework.transaction.annotation.Transactional
import pt.isel.activity.ActivityType
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.user.User
import pt.isel.utils.Either
import pt.isel.utils.failure
import pt.isel.utils.success
import java.time.Instant

@Service
class CabinetService(
    private val cabinetRepo: CabinetRepository,
    private val userRepo: UserRepository,
    private val activityService: ActivityService,
) {

    fun getCabinet(id: Int): Either<CabinetError, Cabinet> {
        val cabinet = cabinetRepo.findByIdOrNull(id) ?: return failure(CabinetError.CabinetNotFound)
        return success(cabinet)
    }

    fun getAllCabinets(): List<Cabinet> = cabinetRepo.findAll()

    @Transactional
    fun updateCabinet(status: CabinetStatus, cid: Int, userId: Int): Either<CabinetError, Cabinet> {
        val cabinet = cabinetRepo.findByIdOrNull(cid) ?: return failure(CabinetError.CabinetNotFound)
        val user = userRepo.findByIdOrNull(userId) ?: return failure(CabinetError.CabinetNotFound)
        val saved = cabinetRepo.saveAndFlush(cabinet.copy(status = status))


        val activityType = when (status) {
            CabinetStatus.OPEN -> ActivityType.OPEN_CABINET
            CabinetStatus.CLOSED -> ActivityType.CLOSE_CABINET
            CabinetStatus.BROKEN, CabinetStatus.INACTIVE -> ActivityType.CABINET_ANOMALY
        }
        activityService.createActivity(user.id, null, saved.id, null,activityType, Instant.now())


        return success(saved)
    }

    fun createCabinet(desc: String, status: CabinetStatus, loc: String): Either<CabinetError, Cabinet> {
        if(desc.isBlank()) return failure(CabinetError.InvalidDescription)
        if(loc.isBlank()) return failure(CabinetError.InvalidLocation)

        val newCabinet = Cabinet(description = desc, status = status, location = loc)
        return success(cabinetRepo.save(newCabinet))
    }
}
