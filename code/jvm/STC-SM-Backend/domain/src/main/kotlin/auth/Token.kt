package auth

import jakarta.persistence.*
import user.User
import java.time.Instant

@Entity
@Table(name = "tokens")
class Token(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,
    @Embedded
    val tokenValidationInfo: TokenValidationInfo,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    val user: User,
    @Column(nullable = false)
    val createdAt: Instant,
    @Column(nullable = false)
    val lastUsedAt: Instant,
)
