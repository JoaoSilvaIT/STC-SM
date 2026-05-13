package shift

import cabinet.Cabinet
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import user.User
import java.time.Instant

@Entity
@Table(name = "shifts")
class Shift(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @ManyToOne(fetch = FetchType.LAZY) // Whenever the call to the database only gets the Shift and not Shift + Cabinet
    @JoinColumn(name = "id_cabinet", referencedColumnName = "id")
    val cabinet: Cabinet,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", referencedColumnName = "id")
    val user: User,
    @Column(nullable = false)
    val startTime: Instant,
    @Column(nullable = false)
    val endTime: Instant,
)
