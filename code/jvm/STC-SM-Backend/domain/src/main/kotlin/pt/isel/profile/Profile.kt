package pt.isel.profile

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "profile")
data class Profile(
    @Id
    val id: Int,
    @Enumerated(EnumType.STRING)
    val role: Role, // This also defines the access level of the app itself
    @Column(nullable = false)
    val description: String,
)
