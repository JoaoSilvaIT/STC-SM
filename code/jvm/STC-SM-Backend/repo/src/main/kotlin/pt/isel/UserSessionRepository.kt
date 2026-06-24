package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.auth.UserSession

@Repository
interface UserSessionRepository : JpaRepository<UserSession, Int> {
    fun findByAccessTokenValidationInfo(accessToken: String): UserSession?

    fun findByRefreshTokenValidationInfo(refreshToken: String): UserSession?
}
