package pt.isel.user

import pt.isel.auth.PasswordValidationInfo
import jakarta.persistence.Column
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import pt.isel.profile.Profile

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
    @ManyToOne(fetch = FetchType.LAZY) // When making a database call only gets the User data instead of User + Profile
    @JoinColumn(name = "id_profile", referencedColumnName = "id")
    val profile: Profile,
    @Enumerated(EnumType.STRING) // Keeps the name of the status (ex: "ACTIVE")
    val status: UserStatus,
    @Embedded // This annotation keeps the JPA from creating a new table just for the password
    val passwordValidation: PasswordValidationInfo,
) {
    fun copy(
        name: String = this.name,
        email: String = this.email,
        profile: Profile = this.profile,
        status: UserStatus = this.status,
        password : PasswordValidationInfo = this.passwordValidation,
    ) = User(
        this.id,
        name,
        email,
        profile,
        status,
        password
    )
}
