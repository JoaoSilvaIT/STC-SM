package pt.isel

import io.mockk.every
import io.mockk.mockk
import org.springframework.data.repository.findByIdOrNull
import pt.isel.errors.ProfileError
import pt.isel.profile.Profile
import pt.isel.profile.Role
import pt.isel.utils.Either
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs

class ProfileServiceTest {

    private val profileRepo: ProfileRepository = mockk()
    private val service = ProfileService(profileRepo)

    private val profile = Profile(id = 1, role = Role.MECHANIC, description = "")

    @Test
    fun `getProfile returns profile when found`() {
        every { profileRepo.findByIdOrNull(1) } returns profile

        val result = service.getProfile(1)

        assertIs<Either.Success<Profile>>(result)
        assertEquals(profile, result.value)
    }

    @Test
    fun `getProfile returns ProfileNotFound when missing`() {
        every { profileRepo.findByIdOrNull(99) } returns null

        val result = service.getProfile(99)

        assertIs<Either.Failure<ProfileError>>(result)
        assertEquals(ProfileError.ProfileNotFound, result.value)
    }
}
