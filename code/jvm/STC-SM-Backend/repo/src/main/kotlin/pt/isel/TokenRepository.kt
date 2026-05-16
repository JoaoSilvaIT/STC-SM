package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.auth.UserSession


@Repository
interface UserSessionRepository : JpaRepository<UserSession, Int> {
    fun findByAccessToken(accessToken: String): UserSession?
    fun findByRefreshToken(refreshToken: String): UserSession?
}