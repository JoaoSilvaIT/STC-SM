package user

import auth.PasswordValidationInfo
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertNotNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserRepositoryTest {

    @Autowired
    lateinit var userRepository: UserRepository

    @Test
    fun `test save user and find existing user using email`() {
        // Mock user
        val pass = PasswordValidationInfo("hash_123")
        val user = User(
            name = "Berna",
            email = "bernaaa@test.com",
            idProfile = 1,
            status = UserStatus.ACTIVE,
            passwordValidation = pass
        )

        // Saves the new user
        val saved = userRepository.save(user)
        println(saved.id)


        // Search using email
        val userSaved = userRepository.findByEmail("bernaaa@test.com")

        assertNotNull(userSaved)
    }
}