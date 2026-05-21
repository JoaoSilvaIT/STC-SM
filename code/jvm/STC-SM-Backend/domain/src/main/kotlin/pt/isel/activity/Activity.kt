package pt.isel.activity

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
import pt.isel.shift.Shift
import pt.isel.tools.Tool
import pt.isel.user.User
import java.time.Instant
import java.time.LocalDateTime


@Entity
@Table(name = "activities")
class Activity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @Enumerated(EnumType.STRING)
    val type: ActivityType,
    @Column(nullable = false, columnDefinition = "TIMESTAMP(0)") // To guarantee the format "YYYY-MM-DD HH:MM:SS"
    val date: Instant,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    val user: User,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tool")
    val tool: Tool? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cabinet")
    val cabinet: Cabinet? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_shift")
    val shift: Shift? = null,
)
