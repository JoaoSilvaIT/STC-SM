package pt.isel.auth

import jakarta.persistence.*
import pt.isel.user.User
import java.time.Instant

@Entity
@Table(name = "user_sessions")
class UserSession(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    // Since both tokens use TokenValidationInfo the attributeOverride needs to invoked in order to have different names on the columns in the sql table
    @Embedded
    @AttributeOverrides(AttributeOverride(name = "validationInfo", column = Column(name="access_token", nullable = false, unique = true)))
    val accessToken: TokenValidationInfo,

    @Embedded
    @AttributeOverrides(AttributeOverride(name = "validationInfo", column = Column(name="refresh_token", nullable = false, unique = true)))
    val refreshToken: TokenValidationInfo,

    @Column(name="access_expires_at", nullable = false)
    val accessTokenExpiresAt: Instant,

    @Column(name="refresh_expires_at", nullable = false)
    val refreshTokenExpiresAt: Instant,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", nullable = false)
    val user: User,
) {
    fun copy(
        accessToken: TokenValidationInfo = this.accessToken,
        refreshToken: TokenValidationInfo = this.refreshToken,
        accessTokenExpiresAt: Instant = this.accessTokenExpiresAt,
        refreshTokenExpiresAt: Instant = this.refreshTokenExpiresAt,
        user: User = this.user
    ) = UserSession(
        this.id,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        user
    )

}
