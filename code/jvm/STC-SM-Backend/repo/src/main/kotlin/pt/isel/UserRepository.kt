package pt.isel

import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.user.User

@Repository
interface UserRepository : JpaRepository<User, Int> {
    // The DTO mapper reads the profile role, so fetch the profile eagerly to avoid N+1.
    @EntityGraph(attributePaths = ["profile"])
    override fun findAll(): List<User>

    fun findByEmail(email: String): User?
}
