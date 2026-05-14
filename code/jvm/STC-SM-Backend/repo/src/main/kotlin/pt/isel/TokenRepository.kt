package pt.isel

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import pt.isel.auth.Token
import pt.isel.auth.TokenValidationInfo
import pt.isel.user.User

@Repository
interface TokenRepository : JpaRepository<Token, Int> {
    fun findByTokenValidationInfo(validationInfo: TokenValidationInfo): Token?

    // Name confusing due to the property name in Token class.
    fun findByTokenValidationInfoValidationInfo(hash: String): Token?

    fun findAllByUser(user: User): List<Token>

    fun getTokenByTokenValidationInfo(tokenValidationInfo: TokenValidationInfo): Token?

    fun deleteByUser(user: User): Int
}