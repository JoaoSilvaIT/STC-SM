package user

import auth.PasswordValidationInfo
import jakarta.persistence.Column
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0, // Starts at 0 from there the DB adds serially

    @Column(nullable = false)
    val name: String,

    @Column(unique = true, nullable = false)
    val email: String,

    @Column(name = "id_profile")
    val idProfile: Int,

    @Enumerated(EnumType.STRING) // Keeps the name of the status (ex: "ACTIVE")
    val status: UserStatus,

    @Embedded // This annotation keeps the JPA from creating a new table just for the password
    val passwordValidation: PasswordValidationInfo
) {
    // The constructor needs to be empty in order to JPA to work
}