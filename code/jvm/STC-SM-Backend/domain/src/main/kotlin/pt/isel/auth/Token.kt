package pt.isel.auth

import jakarta.persistence.*
import pt.isel.user.User
import java.time.Instant

@Entity
@Table(name = "tokens")
class Token(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @Embedded
    val tokenValidationInfo: pt.isel.auth.TokenValidationInfo,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    val user: pt.isel.user.User,
    @Column(nullable = false)
    val createdAt: Instant,
    @Column(nullable = false)
    val lastUsedAt: Instant,
) {
    fun copy(
        tokenValidationInfo: pt.isel.auth.TokenValidationInfo = this.tokenValidationInfo,
        user: pt.isel.user.User = this.user,
        createdAt: Instant = this.createdAt,
        lastUsedAt: Instant = this.lastUsedAt,
    ) = Token(
        this.id,
        tokenValidationInfo,
        user,
        createdAt,
        lastUsedAt
    )
}
