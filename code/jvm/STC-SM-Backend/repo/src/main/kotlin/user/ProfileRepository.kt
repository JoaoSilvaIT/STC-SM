package user

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import profile.Profile

@Repository
interface ProfileRepository: JpaRepository<Profile, Int> {

}