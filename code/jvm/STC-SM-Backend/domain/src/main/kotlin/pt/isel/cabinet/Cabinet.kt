package pt.isel.cabinet

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "cabinets")
class Cabinet(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @Column(nullable = false)
    val description: String,
    @Enumerated(EnumType.STRING)
    val status: CabinetStatus,
    @Column(nullable = false)
    val location: String, // For now a text but can be a class in the future, for scalability cases
) {
    fun copy(
        description: String = this.description,
        status: CabinetStatus = this.status,
        location: String = this.location,
    ) = Cabinet(this.id, description, status, location)
}
