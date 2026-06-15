package pt.isel.alert

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
import pt.isel.cabinet.Cabinet
import pt.isel.shift.Shift
import pt.isel.tools.Tool
import pt.isel.user.User
import java.time.Instant

@Entity
@Table(name = "alerts")
class Alert(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @Column(nullable = false, columnDefinition = "TIMESTAMP(0)")
    val date : Instant,
    @Enumerated(EnumType.STRING)
    val type: AlertType,
    @Enumerated(EnumType.STRING)
    val status : AlertStatus ,
    @Column(nullable = false)
    val message : String,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    val user : User,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tool")
    val tool: Tool? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cabinet")
    val cabinet: Cabinet? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_shift")
    val shift: Shift? = null
) {
    fun copy(
        type: AlertType = this.type,
        status: AlertStatus = this.status,
        message: String = this.message
    ): Alert =
        Alert(
            id = this.id,
            date = date,
            type = type,
            status = status,
            message = message,
            tool = this.tool,
            cabinet = this.cabinet,
            shift = this.shift,
            user = this.user
        )
}