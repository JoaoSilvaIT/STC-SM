import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import user.User

@Repository
interface UserRepository: JpaRepository<User, Int> {
    fun findByEmail(email: String) : User?
}
