package pt.isel

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.springframework.data.repository.findByIdOrNull
import pt.isel.cabinet.Cabinet
import pt.isel.cabinet.CabinetStatus
import pt.isel.errors.CabinetError
import pt.isel.utils.Either
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class CabinetServiceTest {

    private val cabinetRepo: CabinetRepository = mockk(relaxed = true)
    private val activityService: ActivityService = mockk(relaxed = true)
    private val service = CabinetService(cabinetRepo, activityService)

    private val cabinet = Cabinet(id = 1, description = "C", status = CabinetStatus.OPEN, location = "loc")

    @Test
    fun `getCabinet returns the cabinet when found`() {
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet

        val result = service.getCabinet(1)

        assertIs<Either.Success<Cabinet>>(result)
        assertEquals(cabinet, result.value)
    }

    @Test
    fun `getCabinet returns CabinetNotFound when missing`() {
        every { cabinetRepo.findByIdOrNull(99) } returns null

        val result = service.getCabinet(99)

        assertIs<Either.Failure<CabinetError>>(result)
        assertEquals(CabinetError.CabinetNotFound, result.value)
    }

    @Test
    fun `updateCabinet changes status and saves`() {
        every { cabinetRepo.findByIdOrNull(1) } returns cabinet
        val saved = slot<Cabinet>()
        every { cabinetRepo.saveAndFlush(capture(saved)) } answers { firstArg() }

        val result = service.updateCabinet(CabinetStatus.CLOSED, 1)

        assertIs<Either.Success<Cabinet>>(result)
        assertEquals(CabinetStatus.CLOSED, saved.captured.status)
        assertEquals(cabinet.id, saved.captured.id)
    }

    @Test
    fun `updateCabinet returns CabinetNotFound when missing`() {
        every { cabinetRepo.findByIdOrNull(99) } returns null

        val result = service.updateCabinet(CabinetStatus.CLOSED, 99)

        assertIs<Either.Failure<CabinetError>>(result)
        assertEquals(CabinetError.CabinetNotFound, result.value)
    }
}
