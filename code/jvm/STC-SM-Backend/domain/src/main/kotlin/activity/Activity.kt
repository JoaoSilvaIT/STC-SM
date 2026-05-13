package activity

import cabinet.Cabinet
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
import tools.Tool
import user.User
import java.time.Instant

@Entity
@Table(name = "activities")
class Activity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int,

    @Enumerated(EnumType.STRING)
    val type: ActivityType,

    @Column(nullable = false)
    val date: Instant,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tool")
    val tool: Tool,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cabinet")
    val cabinet: Cabinet,
) {
}
