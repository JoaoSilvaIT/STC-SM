package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.profile.Profile

@Repository
interface ProfileRepository : JpaRepository<Profile, Int>
