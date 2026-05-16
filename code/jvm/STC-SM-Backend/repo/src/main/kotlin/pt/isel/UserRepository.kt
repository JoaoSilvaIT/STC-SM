package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.user.User

@Repository
interface UserRepository : JpaRepository<User, Int> {
    fun findByEmail(email: String) : User?
}