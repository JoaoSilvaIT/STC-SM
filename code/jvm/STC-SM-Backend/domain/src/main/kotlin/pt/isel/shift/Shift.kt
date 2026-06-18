package pt.isel.shift

import pt.isel.cabinet.Cabinet
import jakarta.persistence.Column
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
import pt.isel.user.User
import java.time.Instant
import java.time.LocalDate

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

    @Column(nullable = false, columnDefinition = "TIMESTAMP(0)")
    val startTime: Instant,

    @Column(nullable = false, columnDefinition = "TIMESTAMP(0)")
    val endTime: Instant,

    @Enumerated(EnumType.STRING)
    val status: ShiftStatus,

    @Column(name = "last_evaluated_date")
    val lastEvaluatedDate: LocalDate?
) {
    fun copy(
        cabinet: Cabinet = this.cabinet,
        user: User = this.user,
        startTime: Instant = this.startTime,
        endTime: Instant = this.endTime,
        status: ShiftStatus = this.status,
        lastEvaluatedDate: LocalDate? = this.lastEvaluatedDate
    ) = Shift(
        this.id,
        cabinet,
        user,
        startTime,
        endTime,
        status,
        lastEvaluatedDate
    )
}
